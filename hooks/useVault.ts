"use client";

import { useState, useCallback } from "react";
import { parseUnits, formatUnits } from "viem";
import {
  getPublicClient,
  getWalletClient,
  ensureApproval,
} from "@/lib/viem";
import { VAULT_ABI, TOKENS, type TokenSymbol } from "@/lib/constants";

const VAULT_ADDRESS = process.env
  .NEXT_PUBLIC_VAULT_CONTRACT as `0x${string}` | undefined;

export type VaultData = {
  USDm: { amount: string; depositedAt: number };
  USDC: { amount: string; depositedAt: number };
  USDT: { amount: string; depositedAt: number };
  totalUsd: number;
};

export type VaultState = {
  data: VaultData | null;
  isLoading: boolean;
  isPending: boolean;
  error: string | null;
  fetchVault: (user: `0x${string}`) => Promise<void>;
  deposit: (user: `0x${string}`, token: TokenSymbol, amount: string) => Promise<string>;
  withdraw: (user: `0x${string}`, token: TokenSymbol, amount: string) => Promise<string>;
  payAiQuery: (user: `0x${string}`) => Promise<string>;
};

export function useVault(): VaultState {
  const [data, setData] = useState<VaultData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVault = useCallback(async (user: `0x${string}`) => {
    if (!VAULT_ADDRESS) return;
    setIsLoading(true);
    try {
      const client = getPublicClient();
      const result = await client.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "getAllVaults",
        args: [user],
      });

      const [usdmAmt, usdmAt, usdcAmt, usdcAt, usdtAmt, usdtAt] = result as bigint[];

      const usdm = Number(formatUnits(usdmAmt, 18));
      const usdc = Number(formatUnits(usdcAmt, 6));
      const usdt = Number(formatUnits(usdtAmt, 6));

      setData({
        USDm: { amount: usdm.toFixed(2), depositedAt: Number(usdmAt) },
        USDC: { amount: usdc.toFixed(2), depositedAt: Number(usdcAt) },
        USDT: { amount: usdt.toFixed(2), depositedAt: Number(usdtAt) },
        totalUsd: usdm + usdc + usdt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vault");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deposit = useCallback(
    async (user: `0x${string}`, tokenSymbol: TokenSymbol, amount: string): Promise<string> => {
      if (!VAULT_ADDRESS) throw new Error("Vault contract not configured");
      setIsPending(true);
      setError(null);

      try {
        const token = TOKENS[tokenSymbol];
        const parsed = parseUnits(amount, token.decimals);

        // Approve vault to spend tokens
        await ensureApproval(user, token.address, VAULT_ADDRESS, parsed, token.decimals);

        const walletClient = getWalletClient();
        const publicClient = getPublicClient();

        const hash = await walletClient.writeContract({
          account: user,
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: "deposit",
          args: [token.address, parsed],
        } as Parameters<typeof walletClient.writeContract>[0]);

        await publicClient.waitForTransactionReceipt({ hash });
        await fetchVault(user);
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Deposit failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsPending(false);
      }
    },
    [fetchVault]
  );

  const withdraw = useCallback(
    async (user: `0x${string}`, tokenSymbol: TokenSymbol, amount: string): Promise<string> => {
      if (!VAULT_ADDRESS) throw new Error("Vault contract not configured");
      setIsPending(true);
      setError(null);

      try {
        const token = TOKENS[tokenSymbol];
        const parsed = parseUnits(amount, token.decimals);

        const walletClient = getWalletClient();
        const publicClient = getPublicClient();

        const hash = await walletClient.writeContract({
          account: user,
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: "withdraw",
          args: [token.address, parsed],
        } as Parameters<typeof walletClient.writeContract>[0]);

        await publicClient.waitForTransactionReceipt({ hash });
        await fetchVault(user);
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Withdrawal failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsPending(false);
      }
    },
    [fetchVault]
  );

  const payAiQuery = useCallback(
    async (user: `0x${string}`): Promise<string> => {
      if (!VAULT_ADDRESS) throw new Error("Vault contract not configured");
      setIsPending(true);
      setError(null);

      try {
        // Approve USDC for AI query payment
        const publicClient = getPublicClient();
        const price = await publicClient.readContract({
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: "aiQueryPrice",
        }) as bigint;

        await ensureApproval(
          user,
          TOKENS.USDC.address,
          VAULT_ADDRESS,
          price,
          6
        );

        const walletClient = getWalletClient();
        const hash = await walletClient.writeContract({
          account: user,
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: "payAiQuery",
          args: [],
        } as Parameters<typeof walletClient.writeContract>[0]);

        await publicClient.waitForTransactionReceipt({ hash });
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "AI payment failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return { data, isLoading, isPending, error, fetchVault, deposit, withdraw, payAiQuery };
    }
      
