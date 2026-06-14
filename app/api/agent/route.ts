// Force Node.js runtime — this route uses viem/accounts (Node crypto)
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const REGISTRY_ABI = [
  {
    name: "registerAgent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_agentURI", type: "string" }],
    outputs: [],
  },
  {
    name: "agentInfo",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "id",           type: "uint256" },
      { name: "uri",          type: "string"  },
      { name: "isRegistered", type: "bool"    },
    ],
  },
] as const;

const AGENT_REGISTRY = process.env
  .NEXT_PUBLIC_AGENT_REGISTRY_CONTRACT as `0x${string}` | undefined;

// GET — return current registration status
export async function GET() {
  if (!AGENT_REGISTRY) {
    return NextResponse.json({ registered: false, error: "Registry contract not set" });
  }

  try {
    const client = createPublicClient({ chain: celo, transport: http() });
    const [id, uri, isRegistered] = await client.readContract({
      address: AGENT_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "agentInfo",
    }) as [bigint, string, boolean];

    return NextResponse.json({
      registered: isRegistered,
      agentId: id.toString(),
      agentURI: uri,
      registryAddress: AGENT_REGISTRY,
      erc8004IdentityRegistry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
    });
  } catch {
    return NextResponse.json({ registered: false, error: "Query failed" }, { status: 500 });
  }
}

// POST — register Shield AI on ERC-8004 (admin only, called once)
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!AGENT_REGISTRY) {
    return NextResponse.json({ error: "Registry not configured" }, { status: 500 });
  }

  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!deployerKey) {
    return NextResponse.json({ error: "Deployer key missing" }, { status: 500 });
  }

  const { agentURI } = await req.json();
  if (!agentURI || typeof agentURI !== "string") {
    return NextResponse.json({ error: "agentURI required" }, { status: 400 });
  }

  try {
    const account = privateKeyToAccount(deployerKey as `0x${string}`);
    const walletClient = createWalletClient({ account, chain: celo, transport: http() });
    const publicClient = createPublicClient({ chain: celo, transport: http() });

    const hash = await walletClient.writeContract({
      address: AGENT_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "registerAgent",
      args: [agentURI],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      return NextResponse.json({ error: "Registration tx reverted" }, { status: 500 });
    }

    const [id] = await publicClient.readContract({
      address: AGENT_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "agentInfo",
    }) as [bigint, string, boolean];

    return NextResponse.json({
      success: true,
      txHash: hash,
      agentId: id.toString(),
      agentURI,
      celoscan: `https://celoscan.io/tx/${hash}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 500 }
    );
  }
}
