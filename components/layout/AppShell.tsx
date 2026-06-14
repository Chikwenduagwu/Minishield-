"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, TrendingUp, Send, CreditCard, Target, MessageSquare, User, ChevronRight } from "lucide-react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { truncateAddress, formatUsd } from "@/lib/viem";
import clsx from "clsx";

const NAV_ITEMS = [
  {
    group: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, soon: false },
    ],
  },
  {
    group: "Tools",
    items: [
      { href: "/vault",      label: "Savings Vault",  icon: TrendingUp,     soon: false },
      { href: "/remittance", label: "Remittance",      icon: Send,           soon: false },
      { href: "/payments",   label: "Payments",        icon: CreditCard,     soon: true  },
      { href: "/goals",      label: "Goals",           icon: Target,         soon: true  },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { href: "/ai",      label: "AI Assistant", icon: MessageSquare, soon: false },
    ],
  },
  {
    group: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: User, soon: false },
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { address, balances, isConnected } = useMiniPay();

  const pageTitle = NAV_ITEMS.flatMap((g) => g.items)
    .find((i) => i.href === pathname)?.label ?? "MiniShield";

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-black flex flex-col fixed top-0 left-0 bottom-0 z-50 overflow-hidden">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 bg-[var(--orange)] rounded-[10px] flex items-center justify-center relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
              <Shield className="w-5 h-5 text-white relative z-10" strokeWidth={1.8} />
            </div>
            <span className="font-display font-bold text-[21px] text-white">MiniShield</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className="mb-4">
              <p className="font-mono text-[9.5px] text-white/20 uppercase tracking-widest px-3 mb-1.5 pt-2">
                {group.group}
              </p>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.soon ? "#" : item.href}
                    className={clsx(
                      "sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-[13.5px] font-medium no-underline",
                      active
                        ? "bg-[var(--orange-dim)] text-[var(--orange)] border border-[rgba(240,115,0,0.18)]"
                        : "text-white/45 hover:bg-white/6 hover:text-white/80"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.7} />
                    <span className="flex-1">{item.label}</span>
                    {item.soon && (
                      <span className="font-mono text-[9px] bg-[rgba(240,115,0,0.15)] text-[var(--orange)] rounded px-1.5 py-0.5 tracking-wide">
                        SOON
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Wallet status */}
        <div className="px-4 py-4 border-t border-white/5">
          {isConnected && address ? (
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white/5 rounded-xl border border-white/6">
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />
              <div className="overflow-hidden">
                <p className="font-mono text-[11.5px] text-white/50 truncate">
                  {truncateAddress(address)}
                </p>
                <p className="text-[10.5px] text-white/25">Celo Mainnet</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white/5 rounded-xl border border-white/6">
              <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
              <p className="font-mono text-[11.5px] text-white/40">Not connected</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── App topbar ────────────────────────────────────────────── */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="fixed top-0 left-64 right-0 h-16 bg-white/90 backdrop-blur border-b border-[var(--border)] flex items-center justify-between px-8 z-40">
          <h1 className="font-display font-bold text-[17px] text-black">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="text-right">
                <p className="font-display font-bold text-[15px] text-black leading-none">
                  {formatUsd(balances.totalUsd)}
                </p>
                <p className="font-mono text-[10.5px] text-[var(--text-3)] mt-0.5">VAULT BALANCE</p>
              </div>
            )}
            <Link href="/profile">
              <div className="w-9 h-9 rounded-full bg-[var(--orange)] flex items-center justify-center font-display font-bold text-[14px] text-white cursor-pointer hover:opacity-90 transition-opacity">
                {address ? address.slice(2, 4).toUpperCase() : "?"}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="pt-16 flex-1">
          <div className="p-8 page-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
