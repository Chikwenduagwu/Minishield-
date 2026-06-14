<div align="center">

```
███╗   ███╗██╗███╗   ██╗██╗███████╗██╗  ██╗██╗███████╗██╗     ██████╗
████╗ ████║██║████╗  ██║██║██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗
██╔████╔██║██║██╔██╗ ██║██║███████╗███████║██║█████╗  ██║     ██║  ██║
██║╚██╔╝██║██║██║╚██╗██║██║╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║
██║ ╚═╝ ██║██║██║ ╚████║██║███████║██║  ██║██║███████╗███████╗██████╔╝
╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝
```

**Protect the value of money. Support the people you love.**

[![Built on Celo](https://img.shields.io/badge/Built%20on-Celo-FCFF52?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxMCIgZmlsbD0iI0ZDRkY1MiIvPjwvc3ZnPg==)](https://celo.org)
[![MiniPay](https://img.shields.io/badge/Powered%20by-MiniPay-00D395?style=for-the-badge)](https://minipay.opera.com)
[![ERC-8004](https://img.shields.io/badge/Agent-ERC--8004%20Registered-F07300?style=for-the-badge)](https://celoscan.io)
[![x402](https://img.shields.io/badge/Payments-x402%20Micropayments-0A0A0A?style=for-the-badge)](https://x402.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)](https://minishield.vercel.app)

---

*A MiniPay Mini App for the African diaspora. Built for the MiniPay Hackathon and Onchain Agents Hackathon.*

</div>

---

## The Problem

Millions of families across Nigeria, Ghana, Kenya, and beyond face a silent financial crisis every day.

A Nigerian engineer in London sends $300 home every month. By the time it arrives, the Naira has lost another percentage point of value. His family spends the entire amount in two weeks because there is no structure. His mother's electricity bill goes unpaid because he forgot. He has no visibility into how the money was used.

This is not a transfer problem. Every app solves transfers. This is a **financial protection problem** — and no existing tool addresses it.

MiniShield does.

---

## What MiniShield Does

MiniShield is an AI-powered financial protection layer built directly into MiniPay. It combines three things that have never existed in a single tool for emerging market users:

**Stablecoin savings that automatically protect purchasing power.** When funds arrive, a configurable percentage is instantly routed into a USDm vault. The user's money stops depreciating the moment it enters the system.

**Structured remittance scheduling.** Senders lock funds into a smart contract vault and define a release schedule — weekly, bi-weekly, or monthly tranches. Recipients can only claim each tranche after its release date. Overspending becomes structurally impossible.

**An on-chain AI financial assistant.** Shield AI has access to the user's live vault balance, remittance schedule, and upcoming payments. Every query is answered with real on-chain data. Every query costs $0.01 USDC, paid on-chain via the x402 micropayment protocol before the AI responds.

---

## Hackathon Tracks

| Track | Qualification | Details |
|---|---|---|
| MiniPay Mini App | Primary | Full Mini App with auto-connect, USDm/USDC/USDT support, deeplinks |
| Onchain Agents (ERC-8004) | Secondary | Shield AI registered on ERC-8004 Identity Registry |
| x402 Micropayments | Secondary | Every AI query triggers on-chain USDC payment via x402 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        MiniPay Client                        │
│                  (injected wallet, auto-connect)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │     Next.js 14 App      │
              │   (Vercel, Node 20.x)   │
              └────────┬───────┬────────┘
                       │       │
          ┌────────────▼─┐   ┌─▼──────────────┐
          │  API Routes  │   │   Page Routes   │
          │  /api/ai     │   │   /dashboard    │
          │  /api/vault  │   │   /vault        │
          │  /api/agent  │   │   /remittance   │
          └──────┬───────┘   │   /ai           │
                 │           └─────────────────┘
    ┌────────────▼─────────────────────────────────┐
    │              Celo Mainnet (Chain 42220)        │
    │                                               │
    │  ┌──────────────────┐  ┌──────────────────┐  │
    │  │ MiniShieldVault  │  │ RemittanceVault  │  │
    │  │ (USDm/USDC/USDT) │  │ (tranche logic)  │  │
    │  └──────────────────┘  └──────────────────┘  │
    │                                               │
    │  ┌──────────────────┐  ┌──────────────────┐  │
    │  │ShieldAgentReg.   │  │  ERC-8004        │  │
    │  │(on-chain AI ID)  │  │  Registry        │  │
    │  └──────────────────┘  └──────────────────┘  │
    └───────────────────────────────────────────────┘
                 │
    ┌────────────▼────────────┐
    │   Fireworks LLM API     │
    │   (Llama 70B Instruct)  │
    │   with live wallet ctx  │
    └─────────────────────────┘
```

---

## Smart Contracts

All contracts are deployed on **Celo Mainnet** and verified on Celoscan.

| Contract | Address | Purpose |
|---|---|---|
| `MiniShieldVault` | `0x26CCf45DFe05Fa4940Aef7E8dC60806d1E468a1D` | Inflation protection vault + x402 AI payment receiver |
| `RemittanceVault` | `0x13766065D481a37AA52a5aD20c538Fb13812823a` | Smart remittance scheduling with tranche claims |
| `ShieldAgentRegistry` | `0xFB5df7583d1deF8B693236cE896Fc5ec8AEc82A2` | ERC-8004 on-chain agent registration for Shield AI |

### Supported Tokens

| Token | Symbol | Address | Decimals |
|---|---|---|---|
| Mento Dollar | USDm | `0x765DE816845861e75A25fCA122bb6898B8B1282a` | 18 |
| USD Coin | USDC | `0xcebA9300f2b948710d2653dD7B07f33A8B32118C` | 6 |
| Tether USD | USDT | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` | 6 |

### ERC-8004 Agent Identity Registries

| Registry | Address |
|---|---|
| Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` |

---

## x402 Micropayment Flow

```
User types message
       │
       ▼
Frontend calls vault.payAiQuery()
       │
       ▼
On-chain: 0.01 USDC transferred to AI recipient
       │
       ▼
paymentTxHash sent to /api/ai
       │
       ▼
API verifies tx on-chain:
  - receipt.status === "success"
  - block age < 120 seconds
  - aiQueriesUsed[user] > 0
       │
       ▼
Live wallet context built from on-chain data
       │
       ▼
Fireworks LLM called with context + user message
       │
       ▼
AI response returned to user
```

---

## MiniPay Integration Details

MiniShield follows all MiniPay Mini App requirements:

- **No connect button.** The wallet auto-connects on page load via the injected provider.
- **Legacy transactions only.** No EIP-1559 fields. `gasPrice` is used, not `maxFeePerGas`.
- **Fee abstraction.** All transactions use the `feeCurrency` parameter to pay network fees in USDm or USDC. Users never need native CELO.
- **Low balance redirect.** When a user has no stablecoin balance, they are redirected to `link.minipay.xyz/add_cash?tokens=USDm,USDC,USDT`.
- **Receipt deeplinks.** After each transaction, users are linked to `link.minipay.xyz/receipt?tx=HASH&celebrate`.
- **Supported tokens only.** USDm, USDC, and USDT — exactly the tokens MiniPay supports.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Blockchain client | Viem 2.x, Celo Mainnet |
| Smart contracts | Solidity 0.8.24, Hardhat, OpenZeppelin v5 |
| AI | Fireworks AI (Llama 3.1 70B) / Anthropic Claude |
| Agent identity | ERC-8004 on-chain agent registration |
| Micropayments | x402 protocol, USDC on Celo |
| Deployment | Vercel (frontend), Celo Mainnet (contracts) |

---

## Project Structure

```
minishield/
├── app/
│   ├── landing/page.tsx          # Public landing page
│   ├── dashboard/page.tsx        # Main app dashboard
│   ├── vault/page.tsx            # Inflation protection vault UI
│   ├── remittance/page.tsx       # Remittance scheduling UI
│   ├── payments/page.tsx         # Automated payments (coming soon)
│   ├── goals/page.tsx            # Financial goals (coming soon)
│   ├── ai/page.tsx               # Shield AI chat with x402 payment gate
│   ├── profile/page.tsx          # User profile and settings
│   └── api/
│       ├── ai/route.ts           # LLM endpoint with x402 verification
│       ├── agent/route.ts        # ERC-8004 registration endpoint
│       ├── vault/route.ts        # Vault read endpoint
│       └── remittance/route.ts   # Remittance read endpoint
├── components/
│   └── layout/AppShell.tsx       # Sidebar + topbar shell
├── hooks/
│   ├── useMiniPay.ts             # Wallet auto-connect
│   ├── useVault.ts               # Vault contract interactions
│   └── useRemittance.ts          # Remittance contract interactions
├── lib/
│   ├── constants.ts              # ABIs, addresses, token config
│   └── viem.ts                   # Client factory, balance helpers
├── contracts/                    # Solidity source (not deployed by Vercel)
├── scripts/                      # Hardhat deploy scripts
└── test/                         # Contract test suite
```

---

## Local Development

### Prerequisites

- Node.js 20+
- A MiniPay wallet (for testing the Mini App)
- Fireworks API key or Anthropic API key

### Setup

```bash
# Clone the repository
git clone https://github.com/Chikwenduagwu/Minishield-.git
cd Minishield-

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in: FIREWORKS_API_KEY, ADMIN_SECRET

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

For MiniPay testing, expose your local server with ngrok:

```bash
ngrok http 3000
# Paste the https URL into MiniPay's developer settings
```

### Contract Development

```bash
# Compile contracts
npm run compile

# Run tests
npm run test:contracts

# Deploy to Celo mainnet
npm run deploy:mainnet
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CELO_RPC` | Yes | Celo RPC endpoint |
| `NEXT_PUBLIC_VAULT_CONTRACT` | Yes | MiniShieldVault address |
| `NEXT_PUBLIC_REMITTANCE_CONTRACT` | Yes | RemittanceVault address |
| `NEXT_PUBLIC_AGENT_REGISTRY_CONTRACT` | Yes | ShieldAgentRegistry address |
| `FIREWORKS_API_KEY` | Yes* | Fireworks AI API key |
| `ANTHROPIC_API_KEY` | Yes* | Anthropic API key (fallback) |
| `ADMIN_SECRET` | Yes | Secret key for /api/agent admin endpoint |

*One of FIREWORKS_API_KEY or ANTHROPIC_API_KEY is required.

---

## Registering Shield AI on ERC-8004

After deployment, register Shield AI as an on-chain agent:

**Step 1:** Upload `public/agent-metadata.json` to IPFS (via Pinata or NFT.storage).

**Step 2:** Call the registration endpoint once:

```bash
curl -X POST https://your-app.vercel.app/api/agent \
  -H "x-admin-key: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"agentURI": "ipfs://YOUR_METADATA_CID"}'
```

**Step 3:** Verify registration:

```bash
curl https://your-app.vercel.app/api/agent
```

The response includes `agentId` — Shield AI's permanent on-chain identity.

---

## Target Markets

MiniShield is designed for users in inflation-prone countries:

```
Nigeria     Ghana       Kenya
Egypt       Pakistan    Argentina
Turkey      and more...
```

Primary users: African diaspora sending remittances home.
Secondary users: Local freelancers, salary earners, small business owners.

---

## Roadmap

- [x] Inflation Protection Vault (USDm / USDC / USDT)
- [x] Smart Remittance Scheduling
- [x] Shield AI with ERC-8004 Identity
- [x] x402 Micropayment Integration
- [x] MiniPay Mini App compliance
- [ ] Automated Bill Payments (rent, school fees, electricity)
- [ ] Financial Goals with AI milestone tracking
- [ ] Multi-recipient remittance vaults
- [ ] Bridge API integration for bank-to-vault deposits
- [ ] cNGN / cKES / cGHS local stablecoin support (post-MiniPay listing)

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

<div align="center">

Built for the **MiniPay Hackathon** and **Onchain Agents Hackathon**

Deployed on **Celo Mainnet**

*MiniShield — Your money deserves a shield, not a wallet.*

</div>
