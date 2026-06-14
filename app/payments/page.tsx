"use client";

import { CreditCard, Home, Zap, Wifi, Phone, GraduationCap, Plus, Bell } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";

const PAYMENT_TYPES = [
  { icon: Home,          label: "Rent",        amount: "$450.00", due: "1st every month",  color: "bg-indigo-50",  stroke: "text-indigo-500"  },
  { icon: GraduationCap, label: "School Fees", amount: "$180.00", due: "1st Sep 2026",     color: "bg-yellow-50",  stroke: "text-yellow-600"  },
  { icon: Zap,           label: "Electricity", amount: "$32.00",  due: "20th every month", color: "bg-emerald-50", stroke: "text-emerald-600" },
  { icon: Wifi,          label: "Internet",    amount: "$15.00",  due: "5th every month",  color: "bg-blue-50",    stroke: "text-blue-500"    },
  { icon: Phone,         label: "Phone Plan",  amount: "$8.00",   due: "10th every month", color: "bg-red-50",     stroke: "text-red-500"     },
];

export default function PaymentsPage() {
  return (
    <AppShell>
      <div className="bg-black rounded-2xl p-7 mb-6 flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--orange)] rounded-full opacity-[0.07] blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="font-display font-bold text-[22px] text-white mb-1">Automated Payments</h2>
          <p className="text-[13.5px] text-white/40">AI agent executes payments when funds are available. Rent, fees, bills — handled.</p>
        </div>
        <span className="bg-[var(--orange-dim)] text-[var(--orange)] border border-[rgba(240,115,0,0.22)] font-mono text-[11px] px-4 py-1.5 rounded-full flex-shrink-0 uppercase tracking-wide">Coming Soon</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {PAYMENT_TYPES.map((p, i) => (
          <motion.div key={p.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="bg-white border border-[var(--border)] rounded-2xl p-5 relative opacity-70">
            <div className={`w-11 h-11 ${p.color} rounded-[13px] flex items-center justify-center mb-4`}>
              <p.icon className={`w-5 h-5 ${p.stroke}`} strokeWidth={1.6} />
            </div>
            <p className="font-display font-bold text-[16px] text-black mb-1">{p.label}</p>
            <p className="font-mono text-[22px] font-medium text-black mb-2">{p.amount}</p>
            <p className="text-[12px] text-[var(--text-3)]">Due {p.due}</p>
            <div className="absolute top-4 right-4">
              <div className="w-10 h-5 rounded-full bg-black/10 relative">
                <div className="absolute top-[3px] left-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: PAYMENT_TYPES.length * 0.06, duration: 0.45 }} className="bg-transparent border border-[var(--border)] border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-2 min-h-[160px] text-[var(--text-3)]">
          <Plus className="w-8 h-8" strokeWidth={1.2} />
          <span className="font-display font-semibold text-[14px]">Add Payment</span>
          <span className="font-mono text-[11px]">Coming soon</span>
        </motion.div>
      </div>

      <div className="bg-[var(--orange-dim)] border border-[rgba(240,115,0,0.18)] rounded-2xl p-6 flex items-center justify-between gap-4 max-sm:flex-col">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-[var(--orange)] flex-shrink-0" />
          <div>
            <p className="font-display font-bold text-[15px] text-black">Get notified when payments launch</p>
            <p className="text-[13px] text-[var(--text-2)]">Be first to automate your bills on-chain.</p>
          </div>
        </div>
        <button className="btn-primary text-[13.5px] px-5 py-2.5 flex-shrink-0" disabled>Notify Me</button>
      </div>
    </AppShell>
  );
}
