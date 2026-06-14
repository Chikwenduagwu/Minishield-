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
const MOCK_ACTIVITY = [
  { type: "send", label: "Remittance – Week 2", time: "Jun 8 · 09:41", amount: "-$75.00", color: "orange" },
  { type: "recv", label: "USDm Deposit",        time: "Jun 6 · 14:20", amount: "+$200.00", color: "green" },
  { type: "bill", label: "Internet Bill",       time: "Jun 5 · 08:00", amount: "-$15.00", color: "indigo" },
  { type: "send", label: "Remittance – Week 1", time: "Jun 1 · 09:00", amount: "-$75.00", color: "orange" },
];

function ActivityItem({ item }: { item: typeof MOCK_ACTIVITY[0] }) {
  const iconMap = {
    send: Send,
    recv: TrendingUp,
    bill: CreditCard,
  };
  const Icon = iconMap[item.type as keyof typeof iconMap] ?? Send;
  const bgMap = { orange: "bg-[var(--orange-dim)]", green: "bg-green-50", indigo: "bg-indigo-50" };
  const strokeMap = { orange: "text-[var(--orange)]", green: "text-green-600", indigo: "text-indigo-500" };

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-[var(--border)] last:border-0">
      <div className={clsx("w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0", bgMap[item.color as keyof typeof bgMap])}>
        <Icon className={clsx("w-4 h-4", strokeMap[item.color as keyof typeof strokeMap])} strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-black truncate">{item.label}</p>
        <p className="font-mono text-[11px] text-[var(--text-3)] mt-0.5">{item.time}</p>
      </div>
      <span className={clsx(
        "font-display font-bold text-[13.5px] flex-shrink-0",
        item.amount.startsWith("+") ? "text-green-600" : "text-red-500"
      )}>
        {item.amount}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { address, balances, isConnected, isLoading: walletLoading } = useMiniPay();
  const { data: vaultData, fetchVault } = useVault();
  const { senderSchedules, fetchSchedules } = useRemittance();

  useEffect(() => {
    if (address) {
      fetchVault(address);
      fetchSchedules(address);
    }
  }, [address, fetchVault, fetchSchedules]);

  // Loading state
  if (walletLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-3)] text-[14px]">Loading your wallet...</p>
        </div>
      </AppShell>
    );
  }

  // Not connected — user is on desktop outside MiniPay
  if (!isConnected) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
          <div className="w-20 h-20 bg-[var(--orange-dim)] rounded-full flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6L12 2z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-[22px] text-black mb-2">Open inside MiniPay</h2>
            <p className="text-[var(--text-2)] text-[14px] max-w-[280px] mx-auto leading-relaxed">
              MiniShield is a MiniPay Mini App. Your wallet connects automatically when you open this from inside MiniPay.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-[260px]">
            <a href={DEEPLINKS.ADD_CASH} className="btn-primary text-[14px] px-6 py-3 no-underline justify-center">
              Add Funds in MiniPay
            </a>
            <p className="text-[11px] text-[var(--text-3)]">
              No connect button needed — wallet auto-connects inside MiniPay
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const totalVault = vaultData?.totalUsd ?? balances.totalUsd;
  const nextSchedule = senderSchedules[0]?.tranches?.find((t) => !t.claimed && !t.cancelled);

  return (
    <AppShell>
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6 max-xl:grid-cols-2 max-sm:grid-cols-1">
        <StatCard label="Vault Balance"      value={formatUsd(totalVault)}  change="↑ +$47.20"    changeType="up"      icon={Shield}    delay={0} />
        <StatCard label="Sent This Month"    value="$225.00"                change="3 tranches"   changeType="neutral" icon={Send}      delay={0.05} />
        <StatCard label="Inflation Shielded" value="38.2%"                  change="vs NGN"       changeType="up"      icon={TrendingUp} delay={0.1} />
        <StatCard label="Next Release"       value={nextSchedule ? nextSchedule.releaseAt.toLocaleDateString() : "—"} change="in 3 days" changeType="neutral" icon={Clock} delay={0.15} />
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
            {(senderSchedules[0]?.tranches?.slice(0, 4) ?? [
              { index: 0, releaseAt: new Date("2026-06-01"), claimed: true, cancelled: false, claimable: false, amount: "75.00" },
              { index: 1, releaseAt: new Date("2026-06-08"), claimed: true, cancelled: false, claimable: false, amount: "75.00" },
              { index: 2, releaseAt: new Date("2026-06-15"), claimed: false, cancelled: false, claimable: true, amount: "75.00" },
              { index: 3, releaseAt: new Date("2026-06-22"), claimed: false, cancelled: false, claimable: false, amount: "75.00" },
            ]).map((t, i) => (
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
          <span className="font-display font-bold text-[15px] text-black block mb-1">Recent Activity</span>
          {MOCK_ACTIVITY.map((item, i) => (
            <ActivityItem key={i} item={item} />
          ))}
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
                "You've shielded $47.20 from NGN depreciation this month. At this rate you'll hit your school fees goal by August."
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
    
