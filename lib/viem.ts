import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatUnits,
  parseUnits,
  erc20Abi,
} from "viem";
import { celo } from "viem/chains";
import { TOKENS, TOKEN_LIST, DEEPLINKS, type TokenSymbol } from "./constants";

// ── Public client (safe for SSR + client) ────────────────────────────────
export function getPublicClient() {
  return createPublicClient({
    chain: celo,
    transport: http(
      process.env.NEXT_PUBLIC_CELO_RPC ?? "https://forno.celo.org"
    ),
  });
}

// ── Wallet client (client-side only) ─────────────────────────────────────
export function getWalletClient() {
  if (typeof window === "undefined") {
    throw new Error("getWalletClient called server-side");
  }
  if (!window.ethereum) {
    throw new Error(
      "No wallet detected. Open this app inside MiniPay."
    );
  }
  return createWalletClient({
    chain: celo,
    transport: custom(window.ethereum),
  });
}

// ── MiniPay detection ─────────────────────────────────────────────────────
export function isMiniPay(): boolean {
  if (typeof window === "undefined") return false;
  return (window.ethereum as { isMiniPay?: boolean } | undefined)?.isMiniPay === true;
}

// ── Balance helpers ───────────────────────────────────────────────────────
export type PreferredToken = {
  symbol: TokenSymbol;
  address: `0x${string}`;
  feeCurrency: `0x${string}`;
  decimals: number;
  balance: bigint;
  humanBalance: number;
};

export async function getPreferredStablecoin(
  user: `0x${string}`
): Promise<PreferredToken | null> {
  const client = getPublicClient();
  const balances = await Promise.all(
    TOKEN_LIST.map(async (token) => {
      const raw = await client.readContract({
        address: token.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [user],
      });
      return {
        symbol: token.symbol as TokenSymbol,
        address: token.address,
        feeCurrency: token.feeCurrency,
        decimals: token.decimals,
        balance: raw,
        humanBalance: Number(formatUnits(raw, token.decimals)),
      };
    })
  );

  const withFunds = balances.filter((b) => b.balance > 0n);
  if (withFunds.length === 0) return null;
  withFunds.sort((a, b) => b.humanBalance - a.humanBalance);
  return withFunds[0];
}

export async function requireFunds(user: `0x${string}`): Promise<PreferredToken> {
  const preferred = await getPreferredStablecoin(user);
  if (!preferred) {
    if (typeof window !== "undefined") {
      window.location.href = DEEPLINKS.ADD_CASH;
    }
    throw new Error("Insufficient balance — redirecting to deposit");
  }
  return preferred;
}

export async function getAllBalances(user: `0x${string}`) {
  const client = getPublicClient();
  const results = await Promise.all(
    TOKEN_LIST.map(async (token) => {
      const raw = await client.readContract({
        address: token.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [user],
      });
      const formatted = formatUnits(raw, token.decimals);
      return {
        ...token,
        raw,
        formatted,
        usdValue: Number(formatted),
      };
    })
  );
  const totalUsd = results.reduce((s, t) => s + t.usdValue, 0);
  return { tokens: results, totalUsd };
}

// ── Approve helper ────────────────────────────────────────────────────────
export async function ensureApproval(
  user: `0x${string}`,
  token: `0x${string}`,
  spender: `0x${string}`,
  amount: bigint,
  decimals: number
) {
  const client = getPublicClient();
  const walletClient = getWalletClient();

  const allowance = await client.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [user, spender],
  });

  if (allowance >= amount) return; // already approved enough

  // Approve the exact amount needed (not max) — some wallets / RPCs
  // are more reliable with exact approvals than unlimited ones.
  const hash = await walletClient.writeContract({
    account: user,
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, amount],
  } as Parameters<typeof walletClient.writeContract>[0]);

  // Wait for the approval to be mined
  const receipt = await client.waitForTransactionReceipt({ hash, confirmations: 1 });

  if (receipt.status !== "success") {
    throw new Error("Token approval failed on-chain");
  }

  // Re-check allowance with a retry loop — public RPC nodes can lag
  // a few seconds behind the latest block right after a write.
  let confirmed = false;
  for (let i = 0; i < 5; i++) {
    const fresh = await client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [user, spender],
    });
    if (fresh >= amount) {
      confirmed = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  if (!confirmed) {
    throw new Error("Approval did not propagate in time — please try again");
  }
}

// ── Format helpers ────────────────────────────────────────────────────────
export function formatUsd(value: string | number, decimals = 2): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}

export function formatTokenAmount(raw: bigint, decimals: number, precision = 2): string {
  return Number(formatUnits(raw, decimals)).toFixed(precision);
}

export { formatUnits, parseUnits };
