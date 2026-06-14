export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { celo } from "viem/chains";
import { VAULT_ABI, TOKENS } from "@/lib/constants";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT as `0x${string}` | undefined;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user") as `0x${string}` | null;

  if (!user || !user.startsWith("0x")) {
    return NextResponse.json({ error: "user address required" }, { status: 400 });
  }
  if (!VAULT_ADDRESS) {
    return NextResponse.json({ error: "Vault contract not configured" }, { status: 500 });
  }

  try {
    const client = createPublicClient({ chain: celo, transport: http() });
    const result = await client.readContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "getAllVaults",
      args: [user],
    }) as readonly bigint[];

    const [ua, uat, ca, cat, ta, tat] = result;
    const usdm = Number(formatUnits(ua, 18));
    const usdc = Number(formatUnits(ca, 6));
    const usdt = Number(formatUnits(ta, 6));

    return NextResponse.json({
      user,
      vault: {
        USDm: { amount: usdm.toFixed(4), depositedAt: Number(uat), address: TOKENS.USDm.address },
        USDC: { amount: usdc.toFixed(4), depositedAt: Number(cat), address: TOKENS.USDC.address },
        USDT: { amount: usdt.toFixed(4), depositedAt: Number(tat), address: TOKENS.USDT.address },
        totalUsd: (usdm + usdc + usdt).toFixed(2),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to read vault" }, { status: 500 });
  }
}
