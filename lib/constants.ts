// ── Celo Chain Config ─────────────────────────────────────────────────────
export const CELO_CHAIN_ID = 42220;
export const CELO_RPC      = "https://forno.celo.org";

// ── Token Addresses (Celo Mainnet) ────────────────────────────────────────
export const TOKENS = {
  USDm: {
    address:    "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`,
    feeCurrency:"0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`,
    decimals:   18,
    symbol:     "USDm",
    name:       "Mento Dollar",
    color:      "#2775CA",
  },
  USDC: {
    address:    "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}`,
    feeCurrency:"0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B" as `0x${string}`, // adapter
    decimals:   6,
    symbol:     "USDC",
    name:       "USD Coin",
    color:      "#2775CA",
  },
  USDT: {
    address:    "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as `0x${string}`,
    feeCurrency:"0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72" as `0x${string}`, // adapter
    decimals:   6,
    symbol:     "USDT",
    name:       "Tether USD",
    color:      "#26A17B",
  },
} as const;

export type TokenSymbol = keyof typeof TOKENS;
export const TOKEN_LIST = Object.values(TOKENS);

// ── ERC-8004 Registries (Celo Mainnet) ────────────────────────────────────
export const ERC8004 = {
  IDENTITY_REGISTRY:   "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`,
  REPUTATION_REGISTRY: "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as `0x${string}`,
} as const;

// ── MiniPay Deeplinks ─────────────────────────────────────────────────────
export const DEEPLINKS = {
  ADD_CASH:  "https://link.minipay.xyz/add_cash?tokens=USDm,USDC,USDT",
  RECEIPT:   (tx: string, celebrate = true) =>
    `https://link.minipay.xyz/receipt?tx=${tx}${celebrate ? "&celebrate" : ""}`,
  BALANCE:   "https://link.minipay.xyz/balance",
  DISCOVER:  "https://link.minipay.xyz/discover",
} as const;

// ── x402 Micropayment Config ──────────────────────────────────────────────
export const X402 = {
  AI_QUERY_PRICE_USDC: 10_000, // 0.01 USDC (6 decimals)
  AI_QUERY_PRICE_USD:  "0.01",
} as const;

// ── ABIs ──────────────────────────────────────────────────────────────────
export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs:  [{ name: "to", type: "address" }, { name: "value", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs:  [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs:  [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs:  [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "payAiQuery",
    type: "function",
    stateMutability: "nonpayable",
    inputs:  [],
    outputs: [],
  },
  {
    name: "getAllVaults",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "user", type: "address" }],
    outputs: [
      { name: "usdmAmount",      type: "uint256" },
      { name: "usdmDepositedAt", type: "uint256" },
      { name: "usdcAmount",      type: "uint256" },
      { name: "usdcDepositedAt", type: "uint256" },
      { name: "usdtAmount",      type: "uint256" },
      { name: "usdtDepositedAt", type: "uint256" },
    ],
  },
  {
    name: "aiQueryPrice",
    type: "function",
    stateMutability: "view",
    inputs:  [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "aiQueriesUsed",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const REMITTANCE_ABI = [
  {
    name: "createSchedule",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient",     type: "address" },
      { name: "token",         type: "address" },
      { name: "trancheAmount", type: "uint256" },
      { name: "trancheCount",  type: "uint8" },
      { name: "interval",      type: "uint8" },
      { name: "firstRelease",  type: "uint256" },
    ],
    outputs: [{ name: "scheduleId", type: "uint256" }],
  },
  {
    name: "claimTranche",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "scheduleId",   type: "uint256" },
      { name: "trancheIndex", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "cancelSchedule",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "scheduleId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getSchedule",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "scheduleId", type: "uint256" }],
    outputs: [
      { name: "sender",       type: "address" },
      { name: "recipient",    type: "address" },
      { name: "token",        type: "address" },
      { name: "decimals_",    type: "uint8" },
      { name: "active",       type: "bool" },
      { name: "createdAt",    type: "uint256" },
      { name: "trancheCount", type: "uint256" },
    ],
  },
  {
    name: "getTranche",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "scheduleId",   type: "uint256" },
      { name: "trancheIndex", type: "uint256" },
    ],
    outputs: [
      { name: "amount",    type: "uint256" },
      { name: "releaseAt", type: "uint256" },
      { name: "claimed",   type: "bool" },
      { name: "cancelled", type: "bool" },
    ],
  },
  {
    name: "getSenderSchedules",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "sender", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "getRecipientSchedules",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "recipient", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "claimableNow",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "recipient", type: "address" }],
    outputs: [{ name: "totalClaimable", type: "uint256" }],
  },
] as const;
