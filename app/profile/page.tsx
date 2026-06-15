"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMiniPay } from "@/hooks/useMiniPay";
import { formatUsd } from "@/lib/viem";
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
      <button
        onClick={() => setOn(!on)}
        className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200 min-h-0 min-w-0 ${on ? "bg-[var(--orange)]" : "bg-black/12"}`}
        aria-label={label}
        role="switch"
        aria-checked={on}
      >
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
    { label: "Preferred token",  value: "USDm" },
    { label: "Network",          value: "Celo Mainnet" },
    { label: "Vault tokens",     value: "USDm, USDC, USDT" },
    { label: "AI pricing",       value: "$0.01 / query" },
  ];

  return (
    <AppShell>
      {/* Profile hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white border border-[var(--border)] rounded-2xl p-6 mb-5 flex items-center gap-5 max-sm:flex-col max-sm:text-center"
      >
        {/* Avatar */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--orange)] rounded-full flex items-center justify-center font-bold text-[24px] sm:text-[28px] text-white flex-shrink-0">
          {address ? address.slice(2, 4).toUpperCase() : "?"}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-[20px] sm:text-[22px] text-black mb-1">My Wallet</h2>

          {/* Address row */}
          {address ? (
            <div className="flex items-center gap-2 max-sm:justify-center flex-wrap">
              <p className="font-mono text-[11px] sm:text-[12px] text-[var(--text-3)] truncate max-w-[200px] sm:max-w-none">
                {address}
              </p>
              <button
                onClick={copyAddress}
                className="p-1 hover:text-[var(--orange)] text-[var(--text-3)] transition-colors flex-shrink-0 min-h-0 min-w-0"
                aria-label="Copy address"
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                )}
              </button>
              <a
                href={`https://celoscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:text-[var(--orange)] text-[var(--text-3)] transition-colors flex-shrink-0 min-h-0 min-w-0"
                aria-label="View on Celoscan"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          ) : (
            <p className="font-mono text-[12px] text-[var(--text-3)]">Not connected</p>
          )}

          {/* Connection badge */}
          <div className="flex items-center gap-2 mt-2 max-sm:justify-center">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-orange-400"}`} />
            <span className={`text-[12px] font-medium ${isConnected ? "text-green-600" : "text-[var(--text-3)]"}`}>
              {isConnected ? "Connected · Celo Mainnet" : "Not connected"}
            </span>
          </div>
        </div>

        {/* Balance */}
        <div className="text-right max-sm:text-center flex-shrink-0">
          <p className="font-mono text-[10px] text-[var(--text-3)] uppercase tracking-wider mb-1">Total Vault</p>
          <p className="font-bold text-[24px] sm:text-[26px] text-black">{formatUsd(balances.totalUsd)}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-[var(--border)] rounded-2xl p-5"
        >
          <h3 className="font-bold text-[15px] text-black mb-4">Preferences</h3>
          <ToggleRow label="Auto-vault incoming funds"  sub="Convert 70% of deposits to USDm vault" defaultOn={true} />
          <ToggleRow label="Weekly AI summary"          sub="AI financial insights every Monday" defaultOn={true} />
          <ToggleRow label="Release notifications"      sub="Alert when remittance tranches release" defaultOn={true} />
          <ToggleRow label="Low balance alerts"         sub="Notify when vault drops below $50" defaultOn={false} />
          <ToggleRow label="x402 AI payments"           sub="Pay $0.01 USDC per AI query on-chain" defaultOn={true} />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-[var(--border)] rounded-2xl p-5"
        >
          <h3 className="font-bold text-[15px] text-black mb-4">Account Info</h3>
          {stats.map((s) => (
            <div key={s.label} className="flex justify-between items-center py-3 border-b border-[var(--border)] last:border-0">
              <span className="text-[13.5px] text-[var(--text-2)]">{s.label}</span>
              <span className="font-mono text-[12.5px] font-medium text-black">{s.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
            <span className="text-[13.5px] text-[var(--text-2)]">Vault balance</span>
            <span className="font-mono text-[12.5px] font-medium text-green-600">{formatUsd(balances.totalUsd)}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-[13.5px] text-[var(--text-2)]">USDm</span>
            <span className="font-mono text-[12.5px] font-medium text-black">${parseFloat(balances.USDm).toFixed(2)}</span>
          </div>
        </motion.div>
      </div>

      {/* ERC-8004 + x402 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="bg-black rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[var(--orange)] rounded-full opacity-[0.07]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.6" strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <span className="font-bold text-[14px] text-white">Shield AI — ERC-8004</span>
            </div>
            <p className="text-[12.5px] text-white/40 leading-relaxed mb-3">
              Shield AI is registered as an on-chain agent via ERC-8004 Identity Registry on Celo Mainnet.
            </p>
            <a
              href={`https://celoscan.io/address/0xFB5df7583d1deF8B693236cE896Fc5ec8AEc82A2`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--orange)] no-underline hover:underline"
            >
              View on Celoscan
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.45 }}
          className="bg-[var(--orange-dim)] border border-[rgba(240,115,0,0.18)] rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.7" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span className="font-bold text-[14px] text-black">x402 Micropayments</span>
          </div>
          <p className="text-[12.5px] text-[var(--text-2)] leading-relaxed mb-3">
            Every Shield AI query costs $0.01 USDC, paid on-chain via the x402 protocol before the AI responds.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-[12.5px]">
              <span className="text-[var(--text-3)]">Price per query</span>
              <span className="font-mono font-medium text-black">$0.01 USDC</span>
            </div>
            <div className="flex justify-between text-[12.5px]">
              <span className="text-[var(--text-3)]">Protocol</span>
              <span className="font-mono font-medium text-black">x402 on Celo</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
                }
            
