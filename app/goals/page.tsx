"use client";

import { Target, GraduationCap, Shield, DollarSign, Plane, Plus } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";

const GOALS = [
  { icon: GraduationCap, label: "School Fees",     current: 340,  target: 500,  eta: "Aug 2026",  color: "bg-yellow-50",  stroke: "text-yellow-600" },
  { icon: Shield,        label: "Emergency Fund",  current: 450,  target: 1000, eta: "Nov 2026",  color: "bg-[var(--orange-dim)]", stroke: "text-[var(--orange)]" },
  { icon: DollarSign,    label: "Business Capital",current: 440,  target: 2000, eta: "Feb 2027",  color: "bg-green-50",   stroke: "text-green-600"  },
  { icon: Plane,         label: "Travel Fund",     current: 80,   target: 600,  eta: "Dec 2027",  color: "bg-blue-50",    stroke: "text-blue-500"   },
];

function GoalCard({ goal, index }: { goal: typeof GOALS[0]; index: number }) {
  const pct = Math.round((goal.current / goal.target) * 100);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:border-orange-200 hover:-translate-y-0.5 hover:shadow-card-lg transition-all duration-300">
      <div className={`w-11 h-11 ${goal.color} rounded-[13px] flex items-center justify-center mb-5`}>
        <goal.icon className={`w-5 h-5 ${goal.stroke}`} strokeWidth={1.6} />
      </div>
      <h3 className="font-display font-bold text-[17px] text-black mb-1">{goal.label}</h3>
      <p className="text-[12.5px] text-[var(--text-3)] mb-4">Target: ${goal.target.toLocaleString()} · {goal.eta}</p>
      <div className="mb-3">
        <div className="flex justify-between mb-1.5">
          <span className="text-[12px] text-[var(--text-3)]">Progress</span>
          <span className="font-mono text-[12px] font-medium text-black">{pct}%</span>
        </div>
        <div className="h-2 bg-black/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-[var(--orange)] rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 + 0.3 }} />
        </div>
      </div>
      <div className="flex justify-between items-end pt-3 border-t border-[var(--border)]">
        <div>
          <p className="font-display font-bold text-[20px] text-black">${goal.current.toLocaleString()}</p>
          <p className="font-mono text-[11px] text-[var(--text-3)]">of ${goal.target.toLocaleString()}</p>
        </div>
        <p className="text-[11.5px] text-[var(--text-3)]">⏱ Est. {goal.eta}</p>
      </div>
    </motion.div>
  );
}

export default function GoalsPage() {
  return (
    <AppShell>
      <div className="bg-black rounded-2xl p-7 mb-6 flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--orange)] rounded-full opacity-[0.07] blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="font-display font-bold text-[22px] text-white mb-1">Financial Goals</h2>
          <p className="text-[13.5px] text-white/40">Track progress toward your most important targets. AI will alert you when you're off track.</p>
        </div>
        <span className="bg-[var(--orange-dim)] text-[var(--orange)] border border-[rgba(240,115,0,0.22)] font-mono text-[11px] px-4 py-1.5 rounded-full flex-shrink-0 uppercase tracking-wide">Coming Soon</span>
      </div>

      <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {GOALS.map((g, i) => <GoalCard key={g.label} goal={g} index={i} />)}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: GOALS.length * 0.07, duration: 0.45 }} className="bg-transparent border border-[var(--border)] border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 min-h-[220px] text-[var(--text-3)] hover:border-[var(--orange)] hover:text-[var(--orange)] hover:bg-[var(--orange-dim)] transition-all cursor-pointer">
          <Plus className="w-9 h-9" strokeWidth={1.2} />
          <span className="font-display font-bold text-[15px]">New Goal</span>
          <span className="font-mono text-[11.5px]">Coming soon</span>
        </motion.div>
      </div>
    </AppShell>
  );
}
