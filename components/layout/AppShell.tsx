"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMiniPay } from "@/hooks/useMiniPay";
import { truncateAddress, formatUsd } from "@/lib/viem";
import clsx from "clsx";

// ── Inline SVG icons (no external dependency) ─────────────────────────────
const Icons = {
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6L12 2z"/>
    </svg>
  ),
  dashboard: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  vault: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6L12 2z"/>
    </svg>
  ),
  send: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  card: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  target: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  chat: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  user: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  bell: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { group: "Overview", items: [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard", soon: false },
  ]},
  { group: "Tools", items: [
    { href: "/vault",      label: "Savings Vault", icon: "vault",  soon: false },
    { href: "/remittance", label: "Remittance",    icon: "send",   soon: false },
    { href: "/payments",   label: "Payments",      icon: "card",   soon: true  },
    { href: "/goals",      label: "Goals",         icon: "target", soon: true  },
  ]},
  { group: "Intelligence", items: [
    { href: "/ai",      label: "AI Assistant", icon: "chat", soon: false },
  ]},
  { group: "Account", items: [
    { href: "/profile", label: "Profile", icon: "user", soon: false },
  ]},
];

const MOB_NAV = [
  { href: "/dashboard",  label: "Home",    icon: "dashboard" },
  { href: "/vault",      label: "Vault",   icon: "vault"     },
  { href: "/remittance", label: "Send",    icon: "send"      },
  { href: "/ai",         label: "AI",      icon: "chat"      },
  { href: "/profile",    label: "Profile", icon: "user"      },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { address, balances, isConnected } = useMiniPay();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = NAV_ITEMS
    .flatMap(g => g.items)
    .find(i => i.href === pathname)?.label ?? "MiniShield";

  return (
    <div className="flex min-h-screen bg-[var(--surface)]">

      {/* ── Mobile overlay ─────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className={clsx(
        "fixed top-0 left-0 bottom-0 w-64 bg-black flex flex-col z-50 transition-transform duration-300",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 bg-[var(--orange)] rounded-[9px] flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
              <span className="relative z-10 text-white">{Icons.shield}</span>
            </div>
            <span className="font-bold text-[19px] text-white tracking-tight">MiniShield</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/40 hover:text-white/80 transition-colors p-1 min-h-0 min-w-0"
            aria-label="Close menu"
          >
            {Icons.close}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map(group => (
            <div key={group.group} className="mb-3">
              <p className="font-mono text-[9.5px] text-white/20 uppercase tracking-widest px-3 mb-1 pt-2">
                {group.group}
              </p>
              {group.items.map(item => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.soon ? "#" : item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-[13.5px] font-medium no-underline transition-all duration-150 min-h-[44px]",
                      active
                        ? "bg-[var(--orange-dim)] text-[var(--orange)] border border-[rgba(240,115,0,0.18)]"
                        : "text-white/45 hover:bg-white/6 hover:text-white/80"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="flex-shrink-0">{Icons[item.icon as keyof typeof Icons]}</span>
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

        {/* Wallet */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white/5 rounded-xl border border-white/6">
            <span className={clsx(
              "w-2 h-2 rounded-full flex-shrink-0",
              isConnected ? "bg-green-400 animate-pulse" : "bg-orange-400"
            )} />
            <div className="overflow-hidden min-w-0">
              <p className="font-mono text-[11px] text-white/50 truncate">
                {address ? truncateAddress(address) : "Not connected"}
              </p>
              <p className="text-[10px] text-white/25">Celo Mainnet</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">

        {/* Topbar */}
        <header className="fixed top-0 left-0 right-0 lg:left-64 h-14 bg-white/90 backdrop-blur border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors min-h-0 min-w-0"
              aria-label="Open menu"
            >
              {Icons.menu}
            </button>
            <h1 className="font-semibold text-[16px] sm:text-[17px] text-black">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {isConnected && (
              <div className="text-right hidden sm:block">
                <p className="font-bold text-[14px] sm:text-[15px] text-black leading-none">
                  {formatUsd(balances.totalUsd)}
                </p>
                <p className="font-mono text-[10px] text-[var(--text-3)] mt-0.5">VAULT</p>
              </div>
            )}
            <button className="relative p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors min-h-0 min-w-0" aria-label="Notifications">
              {Icons.bell}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--orange)] rounded-full" />
            </button>
            <Link href="/profile">
              <div className="w-9 h-9 rounded-full bg-[var(--orange)] flex items-center justify-center font-bold text-[13px] text-white cursor-pointer hover:opacity-90 transition-opacity min-h-0 min-w-0">
                {address ? address.slice(2, 4).toUpperCase() : "?"}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pt-14 pb-16 lg:pb-0">
          <div className="p-4 sm:p-6 lg:p-8 page-in">{children}</div>
        </main>

        {/* ── Mobile bottom nav ───────────────────────────────── */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-[var(--border)] lg:hidden z-30 safe-bottom">
          <div className="flex justify-around items-center px-2 py-1">
            {MOB_NAV.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors no-underline min-w-[56px] min-h-[44px] justify-center",
                    active ? "text-[var(--orange)]" : "text-[var(--text-3)]"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {Icons[item.icon as keyof typeof Icons]}
                  <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
                }
          
