"use client";

import { useState, useCallback } from "react";
import { parseUnits, formatUnits } from "viem";
import { getPublicClient, getWalletClient, ensureApproval } from "@/lib/viem";
import { REMITTANCE_ABI, TOKENS, type TokenSymbol } from "@/lib/constants";

const REMITTANCE_ADDRESS = process.env
  .NEXT_PUBLIC_REMITTANCE_CONTRACT as `0x${string}` | undefined;

export type TrancheInfo = {
  index: number;
  amount: string;
  releaseAt: Date;
  claimed: boolean;
  cancelled: boolean;
  claimable: boolean;
};

export type ScheduleInfo = {
  id: number;
  sender: string;
  recipient: string;
  token: string;
  tokenSymbol: TokenSymbol;
  active: boolean;
  createdAt: Date;
  tranches: TrancheInfo[];
  totalAmount: number;
  claimedAmount: number;
  remainingAmount: number;
};

export type RemittanceState = {
  senderSchedules: ScheduleInfo[];
  recipientSchedules: ScheduleInfo[];
  claimableNow: string;
  isLoading: boolean;
  isPending: boolean;
  error: string | null;
  fetchSchedules: (user: `0x${string}`) => Promise<void>;
  createSchedule: (params: {
    user: `0x${string}`;
    recipient: `0x${string}`;
    token: TokenSymbol;
    trancheAmount: string;
    trancheCount: number;
    interval: 0 | 1 | 2; // Weekly=0, BiWeekly=1, Monthly=2
    firstRelease?: number;
  }) => Promise<string>;
  claimTranche: (user: `0x${string}`, scheduleId: number, trancheIndex: number) => Promise<string>;
  cancelSchedule: (user: `0x${string}`, scheduleId: number) => Promise<string>;
};

const INTERVAL_SECONDS = { 0: 7 * 86400, 1: 14 * 86400, 2: 30 * 86400 };

export function useRemittance(): RemittanceState {
  const [senderSchedules, setSenderSchedules] = useState<ScheduleInfo[]>([]);
  const [recipientSchedules, setRecipientSchedules] = useState<ScheduleInfo[]>([]);
  const [claimableNow, setClaimableNow] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduleById = useCallback(
    async (id: bigint, client: ReturnType<typeof getPublicClient>): Promise<ScheduleInfo | null> => {
      if (!REMITTANCE_ADDRESS) return null;
      try {
        const sched = await client.readContract({
          address: REMITTANCE_ADDRESS,
          abi: REMITTANCE_ABI,
          functionName: "getSchedule",
          args: [id],
        }) as readonly [string, string, string, number, boolean, bigint, bigint];

        const [sender, recipient, token, , active, createdAt, trancheCount] = sched;

        // Detect token symbol
        const tokenEntry = Object.entries(TOKENS).find(
          ([, t]) => t.address.toLowerCase() === token.toLowerCase()
        );
        const tokenSymbol = (tokenEntry?.[0] ?? "USDm") as TokenSymbol;
        const decimals = TOKENS[tokenSymbol].decimals;

        // Fetch all tranches
        const tranches: TrancheInfo[] = [];
        let totalAmount = 0;
        let claimedAmount = 0;
        const now = Date.now() / 1000;

        for (let i = 0; i < Number(trancheCount); i++) {
          const t = await client.readContract({
            address: REMITTANCE_ADDRESS,
            abi: REMITTANCE_ABI,
            functionName: "getTranche",
            args: [id, BigInt(i)],
          }) as readonly [bigint, bigint, boolean, boolean];

          const [amount, releaseAt, claimed, cancelled] = t;
          const human = Number(formatUnits(amount, decimals));

          tranches.push({
            index: i,
            amount: human.toFixed(2),
            releaseAt: new Date(Number(releaseAt) * 1000),
            claimed,
            cancelled,
            claimable: !claimed && !cancelled && Number(releaseAt) <= now,
          });

          if (!cancelled) totalAmount += human;
          if (claimed) claimedAmount += human;
        }

        return {
          id: Number(id),
          sender,
          recipient,
          token,
          tokenSymbol,
          active,
          createdAt: new Date(Number(createdAt) * 1000),
          tranches,
          totalAmount,
          claimedAmount,
          remainingAmount: totalAmount - claimedAmount,
        };
      } catch {
        return null;
      }
    },
    []
  );

  const fetchSchedules = useCallback(
    async (user: `0x${string}`) => {
      if (!REMITTANCE_ADDRESS) return;
      setIsLoading(true);
      setError(null);

      try {
        const client = getPublicClient();

        const [senderIds, recipientIds, claimable] = await Promise.all([
          client.readContract({
            address: REMITTANCE_ADDRESS,
            abi: REMITTANCE_ABI,
            functionName: "getSenderSchedules",
            args: [user],
          }) as Promise<bigint[]>,
          client.readContract({
            address: REMITTANCE_ADDRESS,
            abi: REMITTANCE_ABI,
            functionName: "getRecipientSchedules",
            args: [user],
          }) as Promise<bigint[]>,
          client.readContract({
            address: REMITTANCE_ADDRESS,
            abi: REMITTANCE_ABI,
            functionName: "claimableNow",
            args: [user],
          }) as Promise<bigint>,
        ]);

        const [senderData, recipientData] = await Promise.all([
          Promise.all(senderIds.map((id) => fetchScheduleById(id, client))),
          Promise.all(recipientIds.map((id) => fetchScheduleById(id, client))),
        ]);

        setSenderSchedules(senderData.filter(Boolean) as ScheduleInfo[]);
        setRecipientSchedules(recipientData.filter(Boolean) as ScheduleInfo[]);
        setClaimableNow(Number(formatUnits(claimable, 18)).toFixed(2));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load schedules");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchScheduleById]
  );

  const createSchedule = useCallback(
    async ({
      user,
      recipient,
      token: tokenSymbol,
      trancheAmount,
      trancheCount,
      interval,
      firstRelease,
    }: Parameters<RemittanceState["createSchedule"]>[0]): Promise<string> => {
      if (!REMITTANCE_ADDRESS) throw new Error("Remittance contract not configured");
      setIsPending(true);
      setError(null);

      try {
        const token = TOKENS[tokenSymbol];
        const parsed = parseUnits(trancheAmount, token.decimals);
        const total = parsed * BigInt(trancheCount);

        await ensureApproval(user, token.address, REMITTANCE_ADDRESS, total, token.decimals);

        const walletClient = getWalletClient();
        const publicClient = getPublicClient();

        const hash = await walletClient.writeContract({
          account: user,
          address: REMITTANCE_ADDRESS,
          abi: REMITTANCE_ABI,
          functionName: "createSchedule",
          args: [
            recipient,
            token.address,
            parsed,
            trancheCount,
            interval,
            BigInt(firstRelease ?? 0),
          ],
          feeCurrency: token.feeCurrency,
        } as Parameters<typeof walletClient.writeContract>[0]);

        await publicClient.waitForTransactionReceipt({ hash });
        await fetchSchedules(user);
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Create schedule failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsPending(false);
      }
    },
    [fetchSchedules]
  );

  const claimTranche = useCallback(
    async (user: `0x${string}`, scheduleId: number, trancheIndex: number): Promise<string> => {
      if (!REMITTANCE_ADDRESS) throw new Error("Remittance contract not configured");
      setIsPending(true);
      setError(null);

      try {
        const walletClient = getWalletClient();
        const publicClient = getPublicClient();

        const hash = await walletClient.writeContract({
          account: user,
          address: REMITTANCE_ADDRESS,
          abi: REMITTANCE_ABI,
          functionName: "claimTranche",
          args: [BigInt(scheduleId), BigInt(trancheIndex)],
          feeCurrency: TOKENS.USDm.feeCurrency,
        } as Parameters<typeof walletClient.writeContract>[0]);

        await publicClient.waitForTransactionReceipt({ hash });
        await fetchSchedules(user);
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Claim failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsPending(false);
      }
    },
    [fetchSchedules]
  );

  const cancelSchedule = useCallback(
    async (user: `0x${string}`, scheduleId: number): Promise<string> => {
      if (!REMITTANCE_ADDRESS) throw new Error("Remittance contract not configured");
      setIsPending(true);
      setError(null);

      try {
        const walletClient = getWalletClient();
        const publicClient = getPublicClient();

        const hash = await walletClient.writeContract({
          account: user,
          address: REMITTANCE_ADDRESS,
          abi: REMITTANCE_ABI,
          functionName: "cancelSchedule",
          args: [BigInt(scheduleId)],
          feeCurrency: TOKENS.USDm.feeCurrency,
        } as Parameters<typeof walletClient.writeContract>[0]);

        await publicClient.waitForTransactionReceipt({ hash });
        await fetchSchedules(user);
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Cancel failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsPending(false);
      }
    },
    [fetchSchedules]
  );

  return {
    senderSchedules,
    recipientSchedules,
    claimableNow,
    isLoading,
    isPending,
    error,
    fetchSchedules,
    createSchedule,
    claimTranche,
    cancelSchedule,
  };
}
