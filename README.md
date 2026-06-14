# MiniShield

> Protect the value of money while making cross-border family support effortless.

MiniShield is a **MiniPay Mini App** built on Celo that combines:
- **Inflation Protection Vault** — save in USDm/USDC/USDT, shield purchasing power
- **Smart Remittance Vault** — schedule structured weekly/monthly releases to family
- **Shield AI** — on-chain AI assistant with ERC-8004 identity + x402 micropayments
- **Financial Goals** *(coming soon)*
- **Automated Payments** *(coming soon)*

---

## Hackathon Tracks

| Track | Status |
|---|---|
| MiniPay Mini App | ✅ Primary |
| Onchain Agents (ERC-8004) | ✅ Eligible |
| x402 Micropayments | ✅ Integrated |

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Blockchain | Viem, Celo Mainnet (chainId 42220) |
| Contracts | Solidity 0.8.24, Hardhat, OpenZeppelin v5 |
| AI | Fireworks LLM (Llama 70B) or Anthropic Claude |
| Payments | x402 micropayment protocol |
| Agent | ERC-8004 Identity Registry |

---

## Contracts

| Contract | Purpose |
|---|---|
| `MiniShieldVault` | Inflation protection vault + x402 AI payment receiver |
| `RemittanceVault` | Smart remittance scheduling with tranche claims |
| `ShieldAgentRegistry` | ERC-8004 on-chain agent registration for Shield AI |

### Supported Tokens (Celo Mainnet)

| Symbol | Address | Decimals |
|---|---|---|
| USDm | `0x765DE816845861e75A25fCA122bb6898B8B1282a` | 18 |
| USDC | `0xcebA9300f2b948710d2653dD7B07f33A8B32118C` | 6 |
| USDT | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` | 6 |

### ERC-8004 Registries

| Contract | Address |
|---|---|
| Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` |

---

## Setup

```bash
# 1. Clone and install
git clone https://github.com/your-org/minishield
cd minishield
npm install

# 2. Configure environment
cp .env.example .env
# Fill in: DEPLOYER_PRIVATE_KEY, FIREWORKS_API_KEY (or ANTHROPIC_API_KEY)

# 3. Compile contracts
npm run compile

# 4. Run tests
npm run test:contracts

# 5. Deploy to Celo Sepolia testnet
npm run deploy:testnet

# 6. Copy contract addresses from output into .env
# NEXT_PUBLIC_VAULT_CONTRACT=0x...
# NEXT_PUBLIC_REMITTANCE_CONTRACT=0x...

# 7. Register Shield AI on ERC-8004
# Upload public/agent-metadata.json to IPFS, then:
# Call ShieldAgentRegistry.registerAgent("ipfs://YOUR_CID")

# 8. Run Next.js dev server
npm run dev
```

---

## MiniPay Integration Notes

- **No connect button** — wallet auto-injects on page load via `window.ethereum`
- **Legacy transactions only** — no EIP-1559 (`maxFeePerGas` / `maxPriorityFeePerGas`)
- **Fee abstraction** — all txs use `feeCurrency` param to pay network fee in USDm/USDC
- **Low balance redirect** — users with no funds are sent to `link.minipay.xyz/add_cash`
- **Receipt deeplinks** — post-tx: `link.minipay.xyz/receipt?tx=HASH&celebrate`

---

## x402 AI Micropayments

Every Shield AI query:
1. User calls `vault.payAiQuery()` → pays **0.01 USDC** on-chain
2. Frontend sends `paymentTxHash` to `/api/ai`
3. API verifies tx on-chain (block age, event, recipient)
4. API calls Fireworks/Anthropic with live wallet context
5. Returns AI response

---

## ERC-8004 Agent Registration

```bash
# After deploy, register Shield AI:
curl -X POST https://your-app.vercel.app/api/agent \
  -H "x-admin-key: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"agentURI": "ipfs://YOUR_METADATA_CID"}'
```

---

## Project Structure

```
minishield/
├── contracts/
│   ├── MiniShieldVault.sol       # Inflation vault + x402
│   ├── RemittanceVault.sol       # Smart remittance scheduling
│   ├── ShieldAgentRegistry.sol   # ERC-8004 agent identity
│   └── MockERC20.sol             # Test helper only
├── scripts/
│   ├── deploy.ts                 # Deploy all 3 contracts
│   └── verify.ts                 # Verify on Celoscan
├── test/
│   └── MiniShield.test.ts        # Contract test suite
├── app/
│   ├── landing/page.tsx          # Public landing page
│   ├── dashboard/page.tsx        # App dashboard
│   ├── vault/page.tsx            # Savings vault UI
│   ├── remittance/page.tsx       # Remittance scheduling UI
│   ├── payments/page.tsx         # Automated payments (coming soon)
│   ├── goals/page.tsx            # Financial goals (coming soon)
│   ├── ai/page.tsx               # Shield AI chat
│   ├── profile/page.tsx          # Profile + settings
│   └── api/
│       ├── ai/route.ts           # LLM + x402 verification
│       ├── agent/route.ts        # ERC-8004 registration
│       ├── vault/route.ts        # Vault read endpoint
│       └── remittance/route.ts   # Remittance read endpoint
├── components/layout/AppShell.tsx
├── hooks/
│   ├── useMiniPay.ts             # Wallet connection
│   ├── useVault.ts               # Vault interactions
│   └── useRemittance.ts          # Remittance interactions
├── lib/
│   ├── constants.ts              # ABIs, addresses, tokens
│   └── viem.ts                   # Client factory, helpers
└── public/
    └── agent-metadata.json       # ERC-8004 IPFS metadata
```
