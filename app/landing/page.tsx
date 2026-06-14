"use client";

import Link from "next/link";
import { Shield, TrendingUp, Send, MessageSquare, Target, CreditCard, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// ── Floating card ─────────────────────────────────────────────────────────
function FloatCard({ children, className, delay = 0 }: { children: React.ReactNode; className: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -10, 0] }}
      transition={{ opacity: { duration: 0.5, delay }, y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay } }}
      className={`absolute glass rounded-2xl px-4 py-3.5 shadow-card-lg backdrop-blur-md hidden xl:block ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, tag, delay }: {
  icon: React.ElementType; title: string; desc: string; tag?: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white border border-[var(--border)] rounded-2xl p-7 relative overflow-hidden hover:border-orange-300 hover:-translate-y-1 hover:shadow-card-lg transition-all duration-300 cursor-default group">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--orange-dim)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {tag && (
        <span className={`absolute top-4 right-4 font-mono text-[9.5px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${tag === "Live" ? "bg-green-50 text-green-600 border-green-200" : "bg-[var(--orange-dim)] text-[var(--orange)] border-[rgba(240,115,0,0.2)]"}`}>
          {tag}
        </span>
      )}
      <div className="w-12 h-12 bg-black rounded-[14px] flex items-center justify-center mb-6 relative z-10">
        <Icon className="w-5 h-5 text-[var(--orange)]" strokeWidth={1.5} />
      </div>
      <h3 className="font-display font-bold text-[18px] text-black mb-2 relative z-10">{title}</h3>
      <p className="text-[13.5px] text-[var(--text-2)] leading-relaxed relative z-10">{desc}</p>
    </motion.div>
  );
}

// ── Ticker ────────────────────────────────────────────────────────────────
const TICKER_ITEMS = ["cUSD → cNGN · Live on Mento", "Celo L2 · Sub-cent Network Fee", "MiniPay · 15M+ Users", "Fee Abstraction · Pay in USDm", "USDm · USDC · USDT", "AI-Powered Assistant", "ERC-8004 Agent Identity", "x402 Micropayments"];

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="bg-[var(--orange)] py-2.5 overflow-hidden">
      <motion.div className="flex whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-8 font-mono text-[11.5px] font-medium text-white border-r border-white/25">
            <span className="text-[7px] opacity-60">◆</span>{item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Main landing page ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="noise min-h-screen bg-white overflow-x-hidden">
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="blob w-[700px] h-[700px] bg-[var(--orange)] -top-48 -right-32" style={{ animationDelay: "0s" }} />
        <div className="blob w-[450px] h-[450px] bg-orange-300 bottom-[10%] -left-24" style={{ animationDelay: "-5s" }} />
        <div className="blob w-[350px] h-[350px] bg-[var(--orange)] top-[45%] left-[35%]" style={{ animationDelay: "-10s" }} />
      </div>

      {/* Nav */}
      <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-4 bg-white/85 backdrop-blur-xl border-b border-[rgba(240,115,0,0.08)] max-sm:px-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[var(--orange)] rounded-[10px] flex items-center justify-center overflow-hidden relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
            <Shield className="w-5 h-5 text-white relative z-10" strokeWidth={1.8} />
          </div>
          <span className="font-display font-bold text-[21px] text-black">MiniShield</span>
        </div>
        <ul className="hidden md:flex gap-8 list-none">
          {["Features", "How It Works", "Impact", "Stories"].map((l) => (
            <li key={l}><a href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="text-[14px] font-medium text-[var(--text-2)] hover:text-[var(--orange)] transition-colors no-underline">{l}</a></li>
          ))}
        </ul>
        <div className="flex gap-3 items-center">
          <button className="btn-secondary text-[13.5px] px-4 py-2 hidden sm:block">Docs</button>
          <Link href="/dashboard" className="btn-primary text-[13.5px] px-5 py-2.5 no-underline flex items-center gap-1.5">
            Launch App <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-28 pb-20 text-center">
        {/* Float cards */}
        <FloatCard className="top-[22%] left-[4%]" delay={0}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[var(--orange-dim)] rounded-[10px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[var(--orange)]" />
            </div>
            <div><p className="text-[12.5px] font-medium text-black">Vault Saved</p><p className="font-mono text-[11px] text-[var(--text-3)]">+$47.20 this month</p></div>
          </div>
        </FloatCard>
        <FloatCard className="top-[30%] right-[4%]" delay={2}>
          <p className="font-mono text-[10px] text-[var(--text-3)] mb-1 uppercase tracking-wider">Next Release</p>
          <p className="font-display font-bold text-[20px] text-black">$75.00</p>
          <p className="text-[11.5px] text-[var(--text-3)]">↑ in 3 days — Jun 15</p>
        </FloatCard>
        <FloatCard className="bottom-[28%] left-[6%]" delay={4}>
          <p className="font-mono text-[10px] text-[var(--text-3)] mb-1 uppercase tracking-wider">Inflation Shielded</p>
          <p className="font-display font-bold text-[20px] text-green-600">38.2%</p>
          <p className="text-[11.5px] text-[var(--text-3)]">vs NGN depreciation</p>
        </FloatCard>

        <div className="max-w-[840px] relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 bg-[var(--orange-dim)] border border-[rgba(240,115,0,0.18)] rounded-full px-4 py-1.5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--orange)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--orange)]" />
            </span>
            <span className="font-mono text-[11.5px] text-[var(--orange)] uppercase tracking-widest">Built on Celo · Powered by MiniPay</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black text-[clamp(42px,7.5vw,82px)] leading-[1.04] tracking-[-0.04em] text-black mb-6">
            Protect Your Money<br />From{" "}
            <span className="text-[var(--orange)] orange-underline">Inflation</span>{" "}While<br />Supporting Loved Ones
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[18px] font-light text-[var(--text-2)] leading-relaxed max-w-[580px] mx-auto mb-10">
            MiniShield combines stablecoin savings, smart remittance scheduling, and AI-powered financial management — so your money works harder across borders.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-3 justify-center flex-wrap">
            <Link href="/dashboard"
              className="font-display font-bold text-[15px] text-white bg-black px-9 py-4 rounded-full no-underline flex items-center gap-2 hover:bg-[var(--orange)] hover:-translate-y-0.5 hover:shadow-orange transition-all duration-300">
              <span>Launch App</span><ArrowRight className="w-4 h-4" />
            </Link>
            <button className="font-display font-semibold text-[15px] text-black bg-transparent border-2 border-black/11 px-8 py-4 rounded-full hover:border-[var(--orange)] hover:text-[var(--orange)] transition-all duration-250 flex items-center gap-2">
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center gap-12 mt-16 pt-10 border-t border-black/5 flex-wrap gap-y-6">
            {[["15M+", "MiniPay Wallets"], ["15+", "Stablecoins"], ["7", "Target Markets"], ["<1¢", "Tx Cost on Celo"]].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="font-display font-black text-[36px] text-black leading-none mb-1">{n.includes("<") ? <><span className="text-[var(--orange)]">&lt;</span>1¢</> : <><span className="text-[var(--orange)]">{n}</span></>}</p>
                <p className="text-[12.5px] text-[var(--text-3)]">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Ticker />

      {/* Problem */}
      <section className="relative z-10 py-28 px-6 bg-black" id="how-it-works">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="font-mono text-[11px] text-[var(--orange)] uppercase tracking-[0.14em] flex items-center gap-2 mb-3">
              <span className="w-4 h-0.5 bg-[var(--orange)] inline-block" />The Problem
            </p>
            <h2 className="font-display font-black text-[clamp(30px,4.5vw,52px)] text-white leading-[1.1] tracking-[-0.03em]">
              Money sent home<br />shouldn't <em className="not-italic text-[var(--orange)]">disappear</em>
            </h2>
          </motion.div>
          <div className="grid grid-cols-3 gap-px mt-14 bg-white/5 rounded-2xl overflow-hidden max-md:grid-cols-1">
            {[
              ["01", "Rapid Inflation Erosion", "Local currencies in Nigeria, Ghana, Kenya lose 20–60% of value yearly. Your savings evaporate before you can use them."],
              ["02", "Remittances Spent Instantly", "Families receive lump sums and spend everything in days. No structure means no long-term financial planning."],
              ["03", "Missed Critical Payments", "School fees, rent, and electricity bills are forgotten. One missed payment derails months of financial progress."],
              ["04", "No Visibility for Senders", "Diaspora members send money blind. No reports, no confirmation of how funds are actually used."],
              ["05", "Complex Cross-Border UX", "Existing apps focus only on transfers. No single tool manages savings, scheduling, and payments together."],
              ["06", "Zero Financial Intelligence", "No app advises on spending capacity or inflation risk. People fly blind in high-stakes financial situations."],
            ].map(([num, title, desc], i) => (
              <motion.div key={num} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-[#111] p-9 group cursor-default relative overflow-hidden hover:bg-[#161616] transition-colors">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--orange)] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                <p className="font-mono text-[10px] text-white/18 mb-5 tracking-widest">{num}</p>
                <div className="w-11 h-11 bg-[var(--orange-dim)] rounded-[13px] flex items-center justify-center mb-5 border border-[rgba(240,115,0,0.18)]">
                  <Shield className="w-5 h-5 text-[var(--orange)]" strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-bold text-[17px] text-white mb-3">{title}</h3>
                <p className="text-[13.5px] text-white/40 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-28 px-6 bg-white" id="features">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-end justify-between mb-16 gap-8 max-md:flex-col max-md:items-start">
            <div>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-mono text-[11px] text-[var(--orange)] uppercase tracking-[0.14em] flex items-center gap-2 mb-3"><span className="w-4 h-0.5 bg-[var(--orange)]" />Features</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display font-black text-[clamp(30px,4vw,50px)] text-black leading-[1.1] tracking-[-0.03em]">
                Everything your money<br />needs to <em className="not-italic text-[var(--orange)]">survive</em>
              </motion.h2>
            </div>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-[14.5px] text-[var(--text-2)] leading-relaxed max-w-[280px]">Five interconnected tools that protect, distribute, schedule, and grow your money across borders.</motion.p>
          </div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-7 max-md:col-span-12"><FeatureCard icon={TrendingUp} title="Inflation Protection Vault"   desc="Auto-convert incoming funds to USDm. Shield purchasing power and track real value preserved over time." tag="Live" delay={0} /></div>
            <div className="col-span-5 max-md:col-span-12"><FeatureCard icon={Send}       title="Smart Remittance Vault"      desc="Schedule weekly or monthly releases to family. Prevent overspending, track history, get reports." tag="Live" delay={0.08} /></div>
            <div className="col-span-8 max-md:col-span-12"><FeatureCard icon={MessageSquare} title="AI Financial Assistant"   desc="Ask anything about your money. Powered by LLM with your live on-chain context — balance, schedule, inflation exposure — injected every session. x402 micropayments per query." tag="Live" delay={0.14} /></div>
            <div className="col-span-4 max-md:col-span-12"><FeatureCard icon={Target}     title="Financial Goals"            desc="Create targets for school fees, business capital, or emergency funds. Track progress visually." tag="Coming Soon" delay={0.2} /></div>
            <div className="col-span-4 max-md:col-span-12"><FeatureCard icon={CreditCard}  title="Automated Payments"        desc="Schedule rent, school fees, electricity. AI agent executes when funds are available." tag="Coming Soon" delay={0.26} /></div>
            <div className="col-span-8 max-md:col-span-12"><FeatureCard icon={Shield}     title="ERC-8004 Agent Identity"    desc="Shield AI is registered as an on-chain agent via ERC-8004. Eligible for Celo Agent Visa and Onchain Agents Hackathon prize track." tag="Live" delay={0.32} /></div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-28 px-6 bg-[var(--surface)]" id="how-it-works">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-mono text-[11px] text-[var(--orange)] uppercase tracking-[0.14em] flex items-center gap-2 justify-center mb-3"><span className="w-4 h-0.5 bg-[var(--orange)]" />How It Works</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display font-black text-[clamp(28px,4vw,48px)] text-black leading-[1.1] tracking-[-0.03em] mb-16">
            Four steps to <em className="not-italic text-[var(--orange)]">financial clarity</em>
          </motion.h2>
          <div className="grid grid-cols-4 gap-0 relative max-md:grid-cols-2 max-sm:grid-cols-1">
            <div className="absolute top-9 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[var(--orange)] to-[rgba(240,115,0,0.15)] max-md:hidden" />
            {[
              ["1", "Connect Wallet",     "Open MiniShield in MiniPay. Your wallet auto-connects — no buttons, no setup."],
              ["2", "Protect Your Value", "Incoming USDm is routed to your Vault. Set the % to protect vs spend freely."],
              ["3", "Schedule Smarter",   "Set up remittance tranches and recurring bills. AI confirms affordability first."],
              ["4", "Track Everything",   "Weekly AI summaries: inflation saved, total sent home, goal progress."],
            ].map(([num, title, desc], i) => (
              <motion.div key={num} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="px-6 text-center group">
                <div className="w-[70px] h-[70px] rounded-full bg-white border-2 border-[var(--border)] flex items-center justify-center mx-auto mb-6 relative z-10 transition-all duration-300 group-hover:bg-[var(--orange)] group-hover:border-[var(--orange)] group-hover:shadow-orange">
                  <span className="font-display font-black text-[22px] text-[var(--text-3)] group-hover:text-white transition-colors">{num}</span>
                </div>
                <h3 className="font-display font-bold text-[17px] text-black mb-2">{title}</h3>
                <p className="text-[13.5px] text-[var(--text-2)] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="relative z-10 py-28 px-6 bg-white" id="impact">
        <div className="max-w-[1200px] mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-mono text-[11px] text-[var(--orange)] uppercase tracking-[0.14em] flex items-center gap-2 mb-3"><span className="w-4 h-0.5 bg-[var(--orange)]" />Impact</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display font-black text-[clamp(28px,4vw,48px)] text-black leading-[1.1] tracking-[-0.03em] mb-12">Numbers that <em className="not-italic text-[var(--orange)]">matter</em></motion.h2>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            {[
              { num: "38%", label: "Average inflation exposure eliminated by switching to USDm stablecoin savings", dark: true, orange: false },
              { num: "15M+", label: "MiniPay users in emerging markets who can access MiniShield today", dark: false, orange: true },
              { num: "4×",   label: "Better family financial planning when remittances are structured in weekly tranches", dark: false, orange: true },
              { num: "$0.01",label: "Maximum tx cost on Celo L2 — making micro-scheduled payments viable at scale", dark: true, orange: false },
            ].map((c, i) => (
              <motion.div key={c.num} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`rounded-2xl p-12 relative overflow-hidden ${c.orange ? "bg-[var(--orange)]" : "bg-black"}`}>
                <div className={`absolute -bottom-12 -right-12 w-48 h-48 rounded-full ${c.orange ? "bg-white/09" : "bg-[var(--orange)]"} opacity-[0.07]`} />
                <p className="font-display font-black text-[70px] text-white leading-none tracking-[-0.04em] mb-3">{c.num}</p>
                <p className={`text-[15px] leading-relaxed max-w-[280px] ${c.orange ? "text-white/78" : "text-white/42"}`}>{c.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-28 px-6 bg-[var(--surface)]" id="stories">
        <div className="max-w-[1200px] mx-auto">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-mono text-[11px] text-[var(--orange)] uppercase tracking-[0.14em] flex items-center gap-2 mb-3"><span className="w-4 h-0.5 bg-[var(--orange)]" />Testimonials</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display font-black text-[clamp(28px,4vw,48px)] text-black leading-[1.1] tracking-[-0.03em] mb-12">Real families.<br /><em className="not-italic text-[var(--orange)]">Real results.</em></motion.h2>
          <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
            {[
              { init: "AO", bg: "bg-[var(--orange)]", name: "Adebayo Okonkwo", role: "Software Engineer, London · Sends to Lagos", text: "I send $300 monthly to my family in Lagos. Before MiniShield they'd spend everything in two weeks. Now it releases weekly and my mum's electricity bill is paid automatically. Night and day difference." },
              { init: "FK", bg: "bg-[#1a1a2e]",        name: "Fatima Kamara",    role: "Freelancer, Accra · Ghana",                  text: "The AI assistant is incredible. I asked if I could afford my daughter's school fees and it told me exactly what I had left after all scheduled payments. That kind of insight changes how I plan everything." },
              { init: "JN", bg: "bg-[#0f4c2a]",        name: "James Njoroge",   role: "Small Business Owner, Nairobi",              text: "Saving in USDm instead of Kenyan shillings has been a revelation. I've preserved 40% more purchasing power over 6 months. MiniShield tracks exactly how much inflation I've avoided — motivating." },
            ].map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.09, duration: 0.5 }}
                className="bg-white border border-[var(--border)] rounded-2xl p-8 relative overflow-hidden hover:border-orange-200 hover:-translate-y-0.5 hover:shadow-card-lg transition-all duration-300">
                <div className="absolute top-[-12px] right-5 font-display font-black text-[100px] text-[var(--orange-dim)] leading-none pointer-events-none">"</div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => <svg key={j} className="w-3.5 h-3.5 fill-[var(--orange)]" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>)}
                </div>
                <p className="text-[14px] text-[var(--text-2)] leading-[1.7] mb-6 relative z-10">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center font-display font-bold text-[14px] text-white flex-shrink-0`}>{t.init}</div>
                  <div><p className="font-display font-bold text-[14.5px] text-black">{t.name}</p><p className="text-[11.5px] text-[var(--text-3)]">{t.role}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-28 px-6 bg-black text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--orange)] opacity-[0.055] blur-[60px] pointer-events-none" />
        <div className="max-w-[660px] mx-auto relative z-10">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display font-black text-[clamp(34px,5.5vw,60px)] text-white leading-[1.1] tracking-[-0.03em] mb-5">
            Your money deserves a <span className="text-[var(--orange)]">shield</span>, not a wallet
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="text-[16.5px] text-white/40 leading-relaxed mb-10">
            Join thousands protecting their purchasing power on Celo. Available inside MiniPay — no extra app needed.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }} className="flex gap-3 justify-center flex-wrap">
            <Link href="/dashboard" className="btn-primary text-[15px] px-10 py-4 no-underline">Launch MiniShield</Link>
            <button className="font-display font-semibold text-[15px] text-white/65 bg-white/7 border border-white/11 px-8 py-4 rounded-full hover:border-white/28 hover:text-white transition-all">Read the Docs</button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-[#060606] px-12 pt-16 pb-10 max-sm:px-5">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-4 gap-14 pb-12 border-b border-white/5 mb-8 max-md:grid-cols-2 max-sm:grid-cols-1">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[var(--orange)] rounded-[9px] flex items-center justify-center flex-shrink-0"><Shield className="w-4 h-4 text-white" strokeWidth={1.8} /></div>
                <span className="font-display font-bold text-[18px] text-white">MiniShield</span>
              </div>
              <p className="text-[13px] text-white/30 leading-relaxed max-w-[240px]">Protect the value of money while making cross-border family support effortless. Built on Celo. Powered by MiniPay.</p>
            </div>
            {[
              { title: "Product", links: ["Inflation Vault", "Remittance Vault", "AI Assistant", "Scheduled Payments ↗", "Financial Goals ↗"] },
              { title: "Developers", links: ["Documentation ↗", "Smart Contracts", "GitHub"] },
              { title: "Company", links: ["About", "Contact", "Privacy Policy"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-display font-bold text-[12px] text-white uppercase tracking-widest mb-4">{col.title}</p>
                <ul className="space-y-3 list-none">
                  {col.links.map((l) => <li key={l}><a className="text-[13px] text-white/30 hover:text-[var(--orange)] transition-colors cursor-pointer no-underline">{l.replace(" ↗", "")}{l.includes("↗") && <span className="ml-1 font-mono text-[9px] bg-[var(--orange-dim)] text-[var(--orange)] border border-[rgba(240,115,0,0.18)] rounded px-1.5 py-0.5">soon</span>}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between max-sm:flex-col max-sm:gap-3 max-sm:text-center">
            <p className="text-[12px] text-white/18">© 2026 MiniShield. All rights reserved.</p>
            <p className="font-mono text-[11px] text-white/18">Built for <span className="text-[var(--orange)]">MiniPay Hackathon</span> · Celo Ecosystem</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
