"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Send, Zap, Clock, ArrowUpRight, ArrowDownLeft, CreditCard, ChevronRight, Shield, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useVault } from "@/hooks/useVault";
import { useRemittance } from "@/hooks/useRemittance";
import { formatUsd } from "@/lib/viem";
import { DEEPLINKS } from "@/lib/constants";
import clsx from "clsx";
import AppShell from "@/components/layout/AppShell";

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({
  label, value, change, changeType, icon: Icon, delay = 0,
}: {
  label: string; value: string; change: string;
  changeType: "up" | "down" | "neutral"; icon: React.ElementType; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden hover:border-orange-300 hover:-translate-y-0.5 hover:shadow-card-lg transition-all duration-300 cursor-default"
    >
      <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-[var(--orange)] opacity-[0.04] translate-x-6 translate-y-6" />
      <div className="absolute top-5 right-5 w-9 h-9 rounded-[11px] bg-[var(--orange-dim)] flex items-center justify-center">
        <Icon className="w-4 h-4 text-[var(--orange)]" strokeWidth={1.7} />
      </div>
      <p className="font-mono text-[11px] text-[var(--text-3)] uppercase tracking-wider mb-2.5">{label}</p>
      <p className="font-display font-bold text-[28px] text-black leading-none mb-2">{value}</p>
      <span className={clsx(
        "inline-flex items-center gap-1 text-[11.5px] font-medium rounded-full px-2.5 py-0.5",
        changeType === "up"      && "bg-green-50 text-green-700",
        changeType === "down"    && "bg-red-50 text-red-600",
        changeType === "neutral" && "bg-[var(--surface-2)] text-[var(--text-3)]"
      )}>
        {change}
      </span>
    </motion.div>
  );
}

// ── Mini chart bar ────────────────────────────────────────────────────────
const CHART_DATA = [
  { month: "Jan", value: 45 },
  { month: "Feb", value: 62 },
  { month: "Mar", value: 41 },
  { month: "Apr", value: 78 },
  { month: "May", value: 57 },
  { month: "Jun", value: 88 },
];

function MiniBarChart() {
  const max = Math.max(...CHART_DATA.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5 h-20 mt-4">
      {CHART_DATA.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: `${(d.value / max) * 100}%`, transformOrigin: "bottom" }}
            className={clsx(
              "w-full rounded-t-[3px]",
              i === CHART_DATA.length - 1
                ? "bg-[var(--orange)]"
                : "bg-[var(--orange-dim)] hover:bg-[var(--orange)] transition-colors"
            )}
          />
          <span className="font-mono text-[8.5px] text-[var(--text-3)]">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ── Activity item ─────────────────────────────────────────────────────────



// ── Main page ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { address, balances, isConnected, isLoading: walletLoading } = useMiniPay();
  const { data: vaultData, fetchVault } = useVault();
  const { senderSchedules, recipientSchedules, fetchSchedules } = useRemittance();

  useEffect(() => {
    if (address) {
      fetchVault(address);
      fetchSchedules(address);
    }
  }, [address, fetchVault, fetchSchedules]);

  // Loading spinner
  if (walletLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  // Not connected — show instructions, not mock data
  if (!isConnected) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
          <div className="w-16 h-16 bg-[var(--orange-dim)] rounded-full flex items-center justify-center">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6L12 2z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-[20px] text-black mb-2">Open inside MiniPay</h2>
            <p className="text-[var(--text-2)] text-[14px] max-w-[260px] mx-auto leading-relaxed">
              MiniShield is a MiniPay Mini App. Your wallet connects automatically — no button needed.
            </p>
          </div>
          <a href="https://link.minipay.xyz/add_cash?tokens=USDm,USDC,USDT"
            className="btn-primary text-[14px] no-underline">
            Add Funds in MiniPay
          </a>
        </div>
      </AppShell>
    );
  }

  const totalVault = vaultData?.totalUsd ?? balances.totalUsd;
  const sentThisMonth = senderSchedules.reduce((sum, s) => sum + s.claimedAmount, 0);
  const nextSchedule = senderSchedules[0]?.tranches?.find((t) => !t.claimed && !t.cancelled);

  return (
    <AppShell>
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6 max-xl:grid-cols-2 max-sm:grid-cols-1">
        <StatCard label="Vault Balance"      value={formatUsd(totalVault)}  change={totalVault > 0 ? "In stablecoins" : "Deposit to start"} changeType={totalVault > 0 ? "up" : "neutral"}      icon={Shield}    delay={0} />
        <StatCard label="Sent This Month"    value={formatUsd(sentThisMonth)} change={`${senderSchedules.length} schedule${senderSchedules.length !== 1 ? "s" : ""}`} changeType="neutral" icon={Send}      delay={0.05} />
        <StatCard label="Inflation Shielded" value="38.2%"                  change="vs NGN"       changeType="up"      icon={TrendingUp} delay={0.1} />
        <StatCard label="Next Release"       value={nextSchedule ? nextSchedule.releaseAt.toLocaleDateString() : "—"} change={nextSchedule ? `${Math.max(0, Math.ceil((nextSchedule.releaseAt.getTime() - Date.now()) / 86400000))} day${nextSchedule ? "s" : ""}` : "—"} changeType="neutral" icon={Clock} delay={0.15} />
      </div>

      {/* Mid row */}
      <div className="grid grid-cols-3 gap-4 mb-6 max-xl:grid-cols-1">
        {/* Chart */}
        <div className="col-span-2 bg-white border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <span className="font-display font-bold text-[15px] text-black">Savings Activity</span>
            <span className="font-mono text-[11px] text-[var(--text-3)]">Last 6 months</span>
          </div>
          <MiniBarChart />
        </div>

        {/* Remittance schedule */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display font-bold text-[15px] text-black">Schedule</span>
            <Link href="/remittance" className="font-mono text-[10.5px] text-[var(--orange)] hover:underline no-underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {senderSchedules.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[13px] text-[var(--text-3)]">No remittance schedules yet</p>
                <Link href="/remittance" className="text-[12px] text-[var(--orange)] no-underline mt-1 inline-block">Create one →</Link>
              </div>
            ) : null}
            {(senderSchedules[0]?.tranches?.slice(0, 4) ?? []).map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-[var(--surface)] rounded-lg px-3 py-2.5 border border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className={clsx(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    t.claimed ? "bg-green-500" : t.claimable ? "bg-[var(--orange)]" : "bg-black/15"
                  )} />
                  <div>
                    <p className="text-[12.5px] font-medium text-black">Week {i + 1}</p>
                    <p className="font-mono text-[10px] text-[var(--text-3)]">{t.releaseAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="font-mono text-[12.5px] font-semibold text-black">${t.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-1">
        {/* Activity */}
        <div className="col-span-2 bg-white border border-[var(--border)] rounded-2xl p-6">
          <span className="font-bold text-[15px] text-black block mb-3">Recent Activity</span>
          {senderSchedules.length === 0 && recipientSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.2" className="mb-3"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <p className="text-[13px] text-[var(--text-3)]">No transactions yet</p>
              <p className="text-[12px] text-[var(--text-3)] mt-1">Your on-chain activity will appear here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {senderSchedules.flatMap(s => s.tranches.filter(t => t.claimed).map(t => ({
                label: `Remittance tranche`,
                time: t.releaseAt.toLocaleDateString(),
                amount: `-$${t.amount}`,
                type: "send",
              }))).slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-[var(--border)] last:border-0">
                  <div className="w-9 h-9 rounded-[10px] bg-[var(--orange-dim)] flex items-center justify-center flex-shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.7"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-black">{item.label}</p>
                    <p className="font-mono text-[11px] text-[var(--text-3)]">{item.time}</p>
                  </div>
                  <span className="font-bold text-[13px] text-red-500">{item.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI insight + Goals */}
        <div className="flex flex-col gap-4">
          {/* AI card */}
          <div className="bg-black rounded-2xl p-6 flex-1 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[var(--orange)] rounded-full opacity-[0.07] blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-[var(--orange)]" />
                <span className="font-display font-bold text-[14px] text-white">AI Insight</span>
              </div>
              <p className="text-[13px] text-white/45 leading-relaxed mb-4">
                {totalVault > 0 ? `Your vault holds $${totalVault.toFixed(2)} in stablecoins. This protects your purchasing power from local currency depreciation.` : "Deposit USDm, USDC, or USDT to start protecting your money from inflation."}
              </p>
              <Link href="/ai" className="block w-full py-2.5 bg-[var(--orange)] text-white text-center font-display font-bold text-[13.5px] rounded-xl no-underline hover:opacity-90 transition-opacity">
                Ask AI Assistant →
              </Link>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-[14px] text-black">Goals</span>
              <Link href="/goals" className="font-mono text-[10px] text-[var(--orange)] hover:underline no-underline">soon</Link>
            </div>
            {[
              { name: "School Fees", pct: 68 },
              { name: "Emergency Fund", pct: 45 },
              { name: "Business Capital", pct: 22 },
            ].map((g) => (
              <div key={g.name} className="mb-3 last:mb-0">
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] font-medium text-black">{g.name}</span>
                  <span className="font-mono text-[11px] text-[var(--text-3)]">{g.pct}%</span>
                </div>
                <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.pct}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    className="h-full bg-[var(--orange)] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
