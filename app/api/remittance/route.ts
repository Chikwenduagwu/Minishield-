export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { celo } from "viem/chains";
import { REMITTANCE_ABI } from "@/lib/constants";

const ADDR = process.env.NEXT_PUBLIC_REMITTANCE_CONTRACT as `0x${string}` | undefined;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user") as `0x${string}` | null;

  if (!user || !user.startsWith("0x")) {
    return NextResponse.json({ error: "user address required" }, { status: 400 });
  }
  if (!ADDR) {
    return NextResponse.json({ error: "Remittance contract not configured" }, { status: 500 });
  }

  try {
    const client = createPublicClient({ chain: celo, transport: http() });

    const [senderIds, recipientIds, claimable] = await Promise.all([
      client.readContract({ address: ADDR, abi: REMITTANCE_ABI, functionName: "getSenderSchedules",    args: [user] }),
      client.readContract({ address: ADDR, abi: REMITTANCE_ABI, functionName: "getRecipientSchedules", args: [user] }),
      client.readContract({ address: ADDR, abi: REMITTANCE_ABI, functionName: "claimableNow",          args: [user] }),
    ]) as [bigint[], bigint[], bigint];

    return NextResponse.json({
      user,
      senderScheduleIds:    (senderIds    as bigint[]).map(String),
      recipientScheduleIds: (recipientIds as bigint[]).map(String),
      claimableNow: Number(formatUnits(claimable as bigint, 18)).toFixed(4),
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to read remittance" }, { status: 500 });
  }
}
