"use client";

import { useEffect, useState } from "react";
import { Shield, TrendingUp, ArrowDown, ArrowUp, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useVault } from "@/hooks/useVault";
import { TOKENS, DEEPLINKS, type TokenSymbol } from "@/lib/constants";
import { formatUsd } from "@/lib/viem";
import clsx from "clsx";
import AppShell from "@/components/layout/AppShell";
import toast from "react-hot-toast";

// ── Token row ─────────────────────────────────────────────────────────────
function TokenRow({
  symbol, balance, depositedAt, onDeposit, onWithdraw, isPending,
}: {
  symbol: TokenSymbol; balance: string; depositedAt: number;
  onDeposit: () => void; onWithdraw: () => void; isPending: boolean;
}) {
  const token = TOKENS[symbol];
  const colorMap: Record<TokenSymbol, string> = {
    USDm: "bg-blue-600",
    USDC: "bg-blue-500",
    USDT: "bg-emerald-600",
  };
  const hasBalance = parseFloat(balance) > 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-orange-200 transition-colors">
      <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-white font-display font-bold text-[14px] flex-shrink-0", colorMap[symbol])}>
        $
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[13px] font-medium text-black">{symbol}</p>
        <p className="text-[11.5px] text-[var(--text-3)]">{token.name}</p>
      </div>
      <div className="text-right mr-4">
        <p className="font-display font-bold text-[14.5px] text-black">{parseFloat(balance).toFixed(2)}</p>
        {depositedAt > 0 && (
          <p className="font-mono text-[10px] text-[var(--text-3)]">
            since {new Date(depositedAt * 1000).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDeposit}
          disabled={isPending}
          className="px-3 py-1.5 bg-[var(--orange)] text-white rounded-lg font-display font-semibold text-[12px] hover:opacity-90 disabled:opacity-40 transition-opacity"
          aria-label={`Deposit ${symbol}`}
        >
          Deposit
        </button>
        <button
          onClick={onWithdraw}
          disabled={isPending || !hasBalance}
          className="px-3 py-1.5 bg-[var(--surface-2)] text-black border border-[var(--border)] rounded-lg font-display font-semibold text-[12px] hover:border-[var(--orange)] hover:text-[var(--orange)] disabled:opacity-40 transition-all"
          aria-label={`Withdraw ${symbol}`}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

// ── Deposit / withdraw modal ───────────────────────────────────────────────
function TxModal({
  mode, token, onConfirm, onClose, isPending,
}: {
  mode: "deposit" | "withdraw"; token: TokenSymbol;
  onConfirm: (amount: string) => Promise<void>; onClose: () => void; isPending: boolean;
}) {
  const [amount, setAmount] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-card-lg"
      >
        <h3 className="font-display font-bold text-[20px] text-black mb-1">
          {mode === "deposit" ? "Deposit to Vault" : "Withdraw from Vault"}
        </h3>
        <p className="text-[13.5px] text-[var(--text-2)] mb-6">
          {mode === "deposit"
            ? `Add ${token} to your inflation-protection vault.`
            : `Withdraw ${token} from your vault.`}
        </p>

        <label className="block text-[12.5px] font-medium text-[var(--text-2)] mb-2">
          Amount ({token})
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-base mb-5"
          placeholder="0.00"
          min="0"
          step="0.01"
          autoFocus
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl font-display font-semibold text-[14px] text-[var(--text-2)] hover:border-[var(--orange)] hover:text-[var(--orange)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!amount || parseFloat(amount) <= 0) return;
              await onConfirm(amount);
            }}
            disabled={isPending || !amount || parseFloat(amount) <= 0}
            className="flex-1 py-3 bg-[var(--orange)] text-white rounded-xl font-display font-bold text-[14px] hover:opacity-90 disabled:opacity-50 transition-opacity relative overflow-hidden"
          >
            <span className="relative z-10">
              {isPending ? "Confirming..." : mode === "deposit" ? "Deposit" : "Withdraw"}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Ring chart ────────────────────────────────────────────────────────────
function InflationRing({ percent }: { percent: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="-rotate-90" width="128" height="128" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="#16a34a"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-[22px] text-green-600">{percent}%</span>
        </div>
      </div>
      <p className="text-[12.5px] text-[var(--text-3)] mt-2 text-center">
        Purchasing power<br />preserved vs NGN
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function VaultPage() {
  const { address } = useMiniPay();
  const { data, isLoading, isPending, error, fetchVault, deposit, withdraw } = useVault();
  const [modal, setModal] = useState<{ mode: "deposit" | "withdraw"; token: TokenSymbol } | null>(null);

  useEffect(() => {
    if (address) fetchVault(address);
  }, [address, fetchVault]);

  const handleConfirm = async (amount: string) => {
    if (!modal || !address) return;
    try {
      const hash = modal.mode === "deposit"
        ? await deposit(address, modal.token, amount)
        : await withdraw(address, modal.token, amount);
      toast.success(`${modal.mode === "deposit" ? "Deposited" : "Withdrawn"} ${amount} ${modal.token}`);
      setModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transaction failed");
    }
  };

  return (
    <AppShell>
      {/* Vault hero */}
      <div className="bg-black rounded-2xl p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[var(--orange)] rounded-full opacity-[0.07] blur-3xl" />
        <div className="relative z-10">
          <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mb-2">Total Protected Value</p>
          <p className="font-display font-bold text-[56px] text-white leading-none tracking-tight mb-2">
            {formatUsd(data?.totalUsd ?? 0)}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[13.5px] text-white/35">In stablecoins</span>
            <span className="bg-green-900/40 text-green-400 font-mono text-[12px] rounded-full px-3 py-0.5 border border-green-800/50">
              +38.2% vs NGN
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 max-xl:grid-cols-1">
        {/* Assets */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
            <h2 className="font-display font-bold text-[15px] text-black mb-5">Vault Assets</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-[var(--surface)] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(["USDm", "USDC", "USDT"] as TokenSymbol[]).map((sym) => (
                  <TokenRow
                    key={sym}
                    symbol={sym}
                    balance={data?.[sym]?.amount ?? "0"}
                    depositedAt={data?.[sym]?.depositedAt ?? 0}
                    isPending={isPending}
                    onDeposit={() => setModal({ mode: "deposit", token: sym })}
                    onWithdraw={() => setModal({ mode: "withdraw", token: sym })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Auto-protection */}
          <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-display font-bold text-[15px] text-black">Auto-Protection</h2>
              <Info className="w-3.5 h-3.5 text-[var(--text-3)]" />
            </div>
            <p className="text-[13px] text-[var(--text-2)] mb-4">
              Percentage of incoming funds automatically converted to USDm vault.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--orange)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="font-mono text-[14px] font-medium text-black w-12 text-right">70%</span>
            </div>
            <p className="font-mono text-[11px] text-[var(--text-3)] mt-2">
              Customizable — coming soon
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Inflation ring */}
          <div className="bg-white border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center">
            <h2 className="font-display font-bold text-[15px] text-black mb-4 self-start w-full">
              Inflation Shielded
            </h2>
            <InflationRing percent={38} />
          </div>

          {/* Low balance */}
          <a
            href={DEEPLINKS.ADD_CASH}
            className="block bg-[var(--orange)] rounded-2xl p-5 hover:opacity-90 transition-opacity no-underline"
          >
            <p className="font-display font-bold text-[14px] text-white mb-1">Need more funds?</p>
            <p className="text-[12.5px] text-white/70">Add USDm, USDC, or USDT directly from MiniPay</p>
            <p className="font-mono text-[11px] text-white/50 mt-2">Tap to open MiniPay deposit →</p>
          </a>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <TxModal
          mode={modal.mode}
          token={modal.token}
          onConfirm={handleConfirm}
          onClose={() => setModal(null)}
          isPending={isPending}
        />
      )}
    </AppShell>
  );
}
