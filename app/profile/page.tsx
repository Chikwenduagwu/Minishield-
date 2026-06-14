"use client";

import { useState } from "react";
import { Shield, Copy, ExternalLink, Check, Bot, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useMiniPay } from "@/hooks/useMiniPay";
import { formatUsd, truncateAddress } from "@/lib/viem";
import AppShell from "@/components/layout/AppShell";
import toast from "react-hot-toast";

function ToggleRow({ label, sub, defaultOn = true }: { label: string; sub: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[var(--border)] last:border-0">
      <div>
        <p className="text-[14px] font-medium text-black">{label}</p>
        <p className="text-[12px] text-[var(--text-3)] mt-0.5">{sub}</p>
      </div>
      <button onClick={() => setOn(!on)} className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200 ${on ? "bg-[var(--orange)]" : "bg-black/12"}`} aria-label={label} role="switch" aria-checked={on}>
        <span className={`absolute top-[4px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-[22px]" : "translate-x-[4px]"}`} />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { address, balances, isConnected } = useMiniPay();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: "Member since",        value: "Jan 2026" },
    { label: "Inflation shielded",  value: "$47.20", highlight: true },
    { label: "Total remitted",      value: "$1,350.00" },
    { label: "AI queries used",     value: "38" },
    { label: "Active vaults",       value: "2" },
    { label: "Preferred token",     value: "USDm" },
  ];

  return (
    <AppShell>
      {/* Profile hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="bg-white border border-[var(--border)] rounded-2xl p-7 mb-5 flex items-center gap-6 max-sm:flex-col max-sm:text-center">
        <div className="w-20 h-20 bg-[var(--orange)] rounded-full flex items-center justify-center font-display font-bold text-[32px] text-white flex-shrink-0">
          {address ? address.slice(2, 4).toUpperCase() : "?"}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-[24px] text-black mb-1">My Wallet</h2>
          {address ? (
            <div className="flex items-center gap-2 max-sm:justify-center">
              <p className="font-mono text-[12.5px] text-[var(--text-3)] truncate">{address}</p>
              <button onClick={copyAddress} className="p-1 hover:text-[var(--orange)] text-[var(--text-3)] transition-colors flex-shrink-0" aria-label="Copy address">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a href={`https://celoscan.io/address/${address}`} target="_blank" rel="noopener noreferrer" className="p-1 hover:text-[var(--orange)] text-[var(--text-3)] transition-colors flex-shrink-0" aria-label="View on Celoscan">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--text-3)]">Not connected</p>
          )}
          <div className="flex items-center gap-2 mt-2 max-sm:justify-center">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[12.5px] text-green-600 font-medium">Connected to Celo Mainnet</span>
          </div>
        </div>
        <div className="text-right max-sm:text-center flex-shrink-0">
          <p className="font-mono text-[11px] text-[var(--text-3)] uppercase tracking-wider mb-1">Total Vault</p>
          <p className="font-display font-bold text-[28px] text-black">{formatUsd(balances.totalUsd)}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-5 mb-5 max-sm:grid-cols-1">
        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <h3 className="font-display font-bold text-[15px] text-black mb-4">Preferences</h3>
          <ToggleRow label="Auto-vault incoming funds"  sub="Convert 70% of deposits to USDm vault" defaultOn={true} />
          <ToggleRow label="Weekly AI summary"          sub="AI-generated financial insights every Monday" defaultOn={true} />
          <ToggleRow label="Release notifications"      sub="Alert when remittance tranches are released" defaultOn={true} />
          <ToggleRow label="Low balance alerts"         sub="Notify when vault drops below $50" defaultOn={false} />
          <ToggleRow label="x402 AI payments"           sub="Pay $0.01 USDC per AI query on-chain" defaultOn={true} />
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <h3 className="font-display font-bold text-[15px] text-black mb-4">Account Stats</h3>
          {stats.map((s) => (
            <div key={s.label} className="flex justify-between items-center py-3 border-b border-[var(--border)] last:border-0">
              <span className="text-[13.5px] text-[var(--text-2)]">{s.label}</span>
              <span className={`font-mono text-[13px] font-medium ${s.highlight ? "text-green-600" : "text-black"}`}>{s.value}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ERC-8004 + x402 info */}
      <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.45 }} className="bg-black rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[var(--orange)] rounded-full opacity-[0.07]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-[var(--orange)]" />
              <span className="font-display font-bold text-[14px] text-white">Shield AI — ERC-8004</span>
            </div>
            <p className="text-[12.5px] text-white/40 leading-relaxed mb-4">Shield AI is registered as an on-chain agent via ERC-8004 Identity Registry. This makes it eligible for the Celo Agent Visa and Onchain Agents Hackathon.</p>
            <a href="https://celoscan.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-[var(--orange)] hover:underline no-underline">
              View on Celoscan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.45 }} className="bg-[var(--orange-dim)] border border-[rgba(240,115,0,0.18)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[var(--orange)]" />
            <span className="font-display font-bold text-[14px] text-black">x402 Micropayments</span>
          </div>
          <p className="text-[12.5px] text-[var(--text-2)] leading-relaxed mb-3">Every Shield AI query costs $0.01 USDC, paid on-chain via the x402 protocol before the AI responds.</p>
          <div className="space-y-2">
            <div className="flex justify-between text-[12.5px]">
              <span className="text-[var(--text-3)]">Queries paid</span>
              <span className="font-mono font-medium text-black">38</span>
            </div>
            <div className="flex justify-between text-[12.5px]">
              <span className="text-[var(--text-3)]">Total spent</span>
              <span className="font-mono font-medium text-black">$0.38 USDC</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
