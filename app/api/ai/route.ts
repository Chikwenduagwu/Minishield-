export const runtime = "nodejs";
export const maxDuration = 30;

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { celo } from "viem/chains";
import { VAULT_ABI } from "@/lib/constants";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT as `0x${string}` | undefined;
const FIREWORKS_KEY = process.env.FIREWORKS_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

async function verifyX402Payment(
  userAddress: string,
  txHash: string | null
): Promise<{ valid: boolean; reason?: string }> {
  if (!txHash) return { valid: false, reason: "No payment tx provided" };
  if (!VAULT_ADDRESS) return { valid: true }; // dev mode

  try {
    const client = createPublicClient({ chain: celo, transport: http() });
    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });

    if (receipt.status !== "success") {
      return { valid: false, reason: "Payment transaction failed" };
    }

    const block = await client.getBlock({ blockNumber: receipt.blockNumber });
    const age = Date.now() / 1000 - Number(block.timestamp);
    if (age > 120) {
      return { valid: false, reason: "Payment receipt older than 2 minutes" };
    }

    const queriesUsed = await client.readContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "aiQueriesUsed",
      args: [userAddress as `0x${string}`],
    }) as bigint;

    if (queriesUsed === 0n) {
      return { valid: false, reason: "No AI queries recorded for this address" };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Payment verification error" };
  }
}

async function buildWalletContext(userAddress: string): Promise<string> {
  if (!VAULT_ADDRESS) {
    return `User address: ${userAddress}. Contract not yet deployed — dev mode.`;
  }

  try {
    const client = createPublicClient({ chain: celo, transport: http() });
    const result = await client.readContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "getAllVaults",
      args: [userAddress as `0x${string}`],
    }) as bigint[];

    const [usdmAmt, usdmAt, usdcAmt, usdcAt, usdtAmt, usdtAt] = result;
    const usdm  = Number(formatUnits(usdmAmt, 18));
    const usdc  = Number(formatUnits(usdcAmt, 6));
    const usdt  = Number(formatUnits(usdtAmt, 6));
    const total = usdm + usdc + usdt;

    const toDate = (ts: bigint) =>
      ts > 0n ? new Date(Number(ts) * 1000).toLocaleDateString() : "N/A";

    return `
SHIELD AI — Live Wallet Context
================================
User: ${userAddress}
Network: Celo Mainnet

VAULT BALANCES:
- USDm: $${usdm.toFixed(2)} (since ${toDate(usdmAt)})
- USDC: $${usdc.toFixed(2)} (since ${toDate(usdcAt)})
- USDT: $${usdt.toFixed(2)} (since ${toDate(usdtAt)})
- TOTAL: $${total.toFixed(2)}

INFLATION CONTEXT:
- NGN depreciation: ~40% annually
- KES depreciation: ~20% annually
- GHS depreciation: ~25% annually
- Holding stablecoins avoids this loss entirely

RULES FOR SHIELD AI:
- Reference real on-chain data above in every answer
- Use exact dollar amounts from context
- Say "network fee" not "gas"
- Say "USDm" not "cUSD"
- Keep responses under 150 words
- Be direct and financially conservative
- Always recommend keeping a buffer of at least $20
`.trim();
  } catch {
    return `User: ${userAddress}. Could not load vault data — RPC error.`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], userAddress, paymentTxHash } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }
    if (!userAddress || typeof userAddress !== "string") {
      return NextResponse.json({ error: "userAddress required" }, { status: 400 });
    }

    // x402 payment gate
    const payment = await verifyX402Payment(userAddress, paymentTxHash ?? null);
    if (!payment.valid && VAULT_ADDRESS) {
      return NextResponse.json(
        { error: "Payment required", code: "x402_PAYMENT_REQUIRED", detail: payment.reason, price: "0.01 USDC" },
        { status: 402 }
      );
    }

    const systemPrompt = await buildWalletContext(userAddress);
    const messages = [
      ...(history as Array<{ role: string; content: string }>).slice(-10),
      { role: "user", content: message },
    ];

    let aiResponse: string;

    if (FIREWORKS_KEY) {
      const resp = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${FIREWORKS_KEY}` },
        body: JSON.stringify({
          model: "accounts/fireworks/models/llama-v3p1-70b-instruct",
          max_tokens: 300,
          temperature: 0.4,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
        }),
      });
      if (!resp.ok) throw new Error(`Fireworks ${resp.status}`);
      const data = await resp.json();
      aiResponse = data.choices?.[0]?.message?.content ?? "No response.";
    } else if (ANTHROPIC_KEY) {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 300,
          system: systemPrompt,
          messages,
        }),
      });
      if (!resp.ok) throw new Error(`Anthropic ${resp.status}`);
      const data = await resp.json();
      aiResponse = data.content?.[0]?.text ?? "No response.";
    } else {
      aiResponse = `[Dev mode — no API key set] Your vault total from on-chain: configure FIREWORKS_API_KEY or ANTHROPIC_API_KEY in Vercel env vars to enable live AI.`;
    }

    return NextResponse.json({ response: aiResponse });
  } catch (err) {
    console.error("[AI API]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
