"use client";

import { useEffect, useState } from "react";
import { Send, Check, Clock, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useRemittance, type ScheduleInfo } from "@/hooks/useRemittance";
import { TOKENS, type TokenSymbol } from "@/lib/constants";
import { formatUsd } from "@/lib/viem";
import clsx from "clsx";
import AppShell from "@/components/layout/AppShell";
import toast from "react-hot-toast";

type CreateParams = {
  recipient: `0x${string}`;
  token: TokenSymbol;
  trancheAmount: string;
  trancheCount: number;
  interval: 0 | 1 | 2;
};

function CreateScheduleForm({ onSubmit, isPending }: { onSubmit: (p: CreateParams) => Promise<void>; isPending: boolean }) {
  const [recipient, setRecipient] = useState("");
  const [token, setToken] = useState<TokenSymbol>("USDm");
  const [trancheAmount, setTrancheAmount] = useState("");
  const [trancheCount, setTrancheCount] = useState("4");
  const [interval, setInterval] = useState<"0" | "1" | "2">("0");

  const totalAmount = parseFloat(trancheAmount || "0") * parseInt(trancheCount || "0");

  const handleSubmit = async () => {
    if (!recipient || !trancheAmount || parseFloat(trancheAmount) <= 0) { toast.error("Fill in all fields"); return; }
    if (!recipient.startsWith("0x") || recipient.length !== 42) { toast.error("Invalid recipient address"); return; }
    await onSubmit({ recipient: recipient as `0x${string}`, token, trancheAmount, trancheCount: parseInt(trancheCount), interval: parseInt(interval) as 0 | 1 | 2 });
  };

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
      <h2 className="font-display font-bold text-[16px] text-black mb-5">New Remittance Schedule</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-[12.5px] font-medium text-[var(--text-2)] mb-1.5">Recipient Address</label>
          <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="input-base font-mono text-[13px]" placeholder="0x..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-2)] mb-1.5">Token</label>
            <select value={token} onChange={(e) => setToken(e.target.value as TokenSymbol)} className="input-base">
              <option value="USDm">USDm (Mento Dollar)</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-2)] mb-1.5">Schedule</label>
            <select value={interval} onChange={(e) => setInterval(e.target.value as "0" | "1" | "2")} className="input-base">
              <option value="0">Weekly</option>
              <option value="1">Bi-weekly</option>
              <option value="2">Monthly</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-2)] mb-1.5">Per Tranche ({token})</label>
            <input type="number" value={trancheAmount} onChange={(e) => setTrancheAmount(e.target.value)} className="input-base" placeholder="75.00" min="0" step="0.01" />
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-[var(--text-2)] mb-1.5"># Tranches (max 52)</label>
            <input type="number" value={trancheCount} onChange={(e) => setTrancheCount(e.target.value)} className="input-base" placeholder="4" min="1" max="52" />
          </div>
        </div>
        {totalAmount > 0 && (
          <div className="flex items-center justify-between bg-[var(--orange-dim)] border border-[rgba(240,115,0,0.18)] rounded-xl px-4 py-3">
            <span className="text-[13px] text-[var(--text-2)]">Total to lock</span>
            <span className="font-display font-bold text-[15px] text-[var(--orange)]">{formatUsd(totalAmount)} {token}</span>
          </div>
        )}
        <button onClick={handleSubmit} disabled={isPending || !recipient || !trancheAmount} className="w-full py-3.5 bg-black text-white rounded-xl font-display font-bold text-[14px] hover:bg-[var(--orange)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {isPending ? "Creating on-chain..." : "Create Schedule →"}
        </button>
      </div>
    </div>
  );
}

function ScheduleCard({ schedule, isRecipient, onClaim, onCancel, isPending }: {
  schedule: ScheduleInfo; isRecipient: boolean;
  onClaim: (id: number, idx: number) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
  isPending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const claimable = schedule.tranches.filter((t) => t.claimable);
  const progress = schedule.totalAmount > 0 ? (schedule.claimedAmount / schedule.totalAmount) * 100 : 0;

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[var(--surface)] transition-colors" onClick={() => setExpanded(!expanded)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx("w-2 h-2 rounded-full flex-shrink-0", schedule.active ? "bg-green-500 animate-pulse" : "bg-black/20")} />
            <p className="font-mono text-[11.5px] text-[var(--text-3)] truncate">
              {isRecipient ? `From: ${schedule.sender.slice(0, 10)}...` : `To: ${schedule.recipient.slice(0, 10)}...`}
            </p>
          </div>
          <p className="font-display font-bold text-[16px] text-black">{formatUsd(schedule.totalAmount)} {schedule.tokenSymbol}</p>
          <p className="text-[12px] text-[var(--text-3)] mt-0.5">{schedule.tranches.length} tranches · {schedule.claimedAmount.toFixed(0)} claimed</p>
        </div>
        {claimable.length > 0 && (
          <span className="bg-[var(--orange-dim)] text-[var(--orange)] font-mono text-[10px] rounded-full px-2.5 py-1 border border-[rgba(240,115,0,0.2)] flex-shrink-0">
            {claimable.length} claimable
          </span>
        )}
        {expanded ? <ChevronUp className="w-4 h-4 text-[var(--text-3)] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[var(--text-3)] flex-shrink-0" />}
      </div>

      <div className="px-5 pb-3">
        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-[var(--orange)] rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-[var(--border)]">
            <div className="p-4 space-y-2">
              {schedule.tranches.map((t) => (
                <div key={t.index} className={clsx(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-[13px]",
                  t.claimed ? "bg-green-50 border-green-100" :
                  t.cancelled ? "bg-[var(--surface-2)] border-[var(--border)] opacity-50" :
                  t.claimable ? "bg-[var(--orange-dim)] border-[rgba(240,115,0,0.2)]" :
                  "bg-[var(--surface)] border-[var(--border)]"
                )}>
                  <div className="flex items-center gap-2.5">
                    <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", t.claimed ? "bg-green-500" : t.cancelled ? "bg-black/20" : t.claimable ? "bg-[var(--orange)]" : "bg-black/10")}>
                      {t.claimed && <Check className="w-3 h-3 text-white" />}
                      {t.cancelled && <X className="w-3 h-3 text-white/60" />}
                      {!t.claimed && !t.cancelled && <Clock className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium text-black">Tranche {t.index + 1}</p>
                      <p className="font-mono text-[10px] text-[var(--text-3)]">{t.releaseAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-black">${t.amount}</span>
                    {t.claimable && isRecipient && (
                      <button onClick={() => onClaim(schedule.id, t.index)} disabled={isPending} className="px-2.5 py-1 bg-[var(--orange)] text-white text-[11px] font-display font-bold rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity">
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!isRecipient && schedule.active && (
                <button onClick={() => onCancel(schedule.id)} disabled={isPending} className="w-full py-2 bg-red-50 border border-red-100 text-red-600 text-[12.5px] font-display font-semibold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-40 mt-2">
                  Cancel Remaining Tranches
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RemittancePage() {
  const { address } = useMiniPay();
  const { senderSchedules, recipientSchedules, claimableNow, isLoading, isPending, fetchSchedules, createSchedule, claimTranche, cancelSchedule } = useRemittance();

  useEffect(() => { if (address) fetchSchedules(address); }, [address, fetchSchedules]);

  const handleCreate = async (data: CreateParams) => {
    if (!address) return;
    try {
      await createSchedule({ user: address, ...data });
      toast.success("Schedule created on-chain!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleClaim = async (scheduleId: number, trancheIndex: number) => {
    if (!address) return;
    try { await claimTranche(address, scheduleId, trancheIndex); toast.success("Tranche claimed!"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Claim failed"); }
  };

  const handleCancel = async (scheduleId: number) => {
    if (!address) return;
    if (!confirm("Cancel all remaining tranches and return funds?")) return;
    try { await cancelSchedule(address, scheduleId); toast.success("Schedule cancelled"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Cancel failed"); }
  };

  return (
    <AppShell>
      <div className="grid grid-cols-2 gap-4 mb-6 max-sm:grid-cols-1">
        <div className="bg-[var(--orange)] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <p className="font-mono text-[11px] text-white/70 uppercase tracking-widest mb-2">Total Sent This Month</p>
          <p className="font-display font-bold text-[40px] text-white leading-none mb-1">$225.00</p>
          <p className="text-[13px] text-white/70">3 of 4 tranches released</p>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
          <p className="font-mono text-[11px] text-[var(--text-3)] uppercase tracking-widest mb-2">Claimable Now</p>
          <p className="font-display font-bold text-[40px] text-black leading-none mb-1">{formatUsd(parseFloat(claimableNow))}</p>
          <p className="text-[13px] text-[var(--text-3)]">Available to claim on-chain</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5 max-xl:grid-cols-1">
        <div className="col-span-2"><CreateScheduleForm onSubmit={handleCreate} isPending={isPending} /></div>
        <div className="col-span-3 space-y-5">
          {recipientSchedules.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-[15px] text-black mb-3">Incoming Schedules</h2>
              <div className="space-y-3">{recipientSchedules.map((s) => <ScheduleCard key={s.id} schedule={s} isRecipient onClaim={handleClaim} onCancel={handleCancel} isPending={isPending} />)}</div>
            </div>
          )}
          <div>
            <h2 className="font-display font-bold text-[15px] text-black mb-3">{senderSchedules.length > 0 ? "Your Schedules" : "No Schedules Yet"}</h2>
            {isLoading ? (
              <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 bg-[var(--surface)] rounded-2xl animate-pulse" />)}</div>
            ) : senderSchedules.length > 0 ? (
              <div className="space-y-3">{senderSchedules.map((s) => <ScheduleCard key={s.id} schedule={s} isRecipient={false} onClaim={handleClaim} onCancel={handleCancel} isPending={isPending} />)}</div>
            ) : (
              <div className="bg-[var(--surface)] rounded-2xl p-8 text-center border border-[var(--border)] border-dashed">
                <Send className="w-10 h-10 text-[var(--text-3)] mx-auto mb-3" strokeWidth={1.2} />
                <p className="font-display font-bold text-[15px] text-black mb-1">No schedules yet</p>
                <p className="text-[13.5px] text-[var(--text-2)]">Create your first remittance schedule above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
