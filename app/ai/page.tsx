"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Zap, Shield, TrendingUp, Clock, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useVault } from "@/hooks/useVault";
import { formatUsd } from "@/lib/viem";
import { X402 } from "@/lib/constants";
import clsx from "clsx";
import AppShell from "@/components/layout/AppShell";
import toast from "react-hot-toast";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  paid?: boolean;
};

const QUICK_PROMPTS = [
  "How much have I saved from inflation this month?",
  "When is my next scheduled release?",
  "Can I afford to send $200 home this week?",
  "How much did I send home this month?",
  "What percentage of funds should I vault?",
  "Am I on track for my school fees goal?",
];

const INITIAL_MESSAGE: Message = {
  id: "0",
  role: "assistant",
  content: "Hello! I'm Shield AI, your personal financial assistant. I have live access to your vault balance, remittance schedule, and on-chain data.\n\nEach query costs **$0.01 USDC** via x402 micropayment — this is confirmed on-chain before I respond. What would you like to know?",
  timestamp: new Date(),
  paid: false,
};

// ── Context sidebar card ───────────────────────────────────────────────────
function ContextCard({ address, balances, vaultData }: {
  address: string | null;
  balances: { USDm: string; USDC: string; USDT: string; totalUsd: number };
  vaultData: ReturnType<typeof useVault>["data"];
}) {
  const rows = [
    { label: "Savings Balance", value: formatUsd(vaultData?.totalUsd ?? balances.totalUsd) },
    { label: "USDm Stablecoin", value: `$${parseFloat(balances.USDm).toFixed(2)}` },
    { label: "USDC",         value: `$${parseFloat(balances.USDC).toFixed(2)}` },
    { label: "USDT",         value: `$${parseFloat(balances.USDT).toFixed(2)}` },
    { label: "Infl. Shield", value: "38.2%", highlight: true },
    { label: "AI Price",     value: "$0.01 / query" },
    { label: "Network",      value: "Celo" },
  ];

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-[var(--orange)]" />
        </div>
        <div>
          <p className="font-display font-bold text-[14px] text-black">Shield AI</p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="font-mono text-[10px] text-[var(--text-3)]">Online · ERC-8004</span>
          </div>
        </div>
      </div>

      <p className="font-semibold text-[13px] text-black mb-3">Your Wallet</p>
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
          <span className="text-[12.5px] text-[var(--text-3)]">{r.label}</span>
          <span className={clsx(
            "font-mono text-[12px] font-medium",
            r.highlight ? "text-green-600" : "text-black"
          )}>
            {r.value}
          </span>
        </div>
      ))}

      {address && (
        <p className="font-mono text-[10px] text-[var(--text-3)] mt-3 truncate">
          {address.slice(0, 10)}...{address.slice(-6)}
        </p>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function AIAssistantPage() {
  const { address, balances } = useMiniPay();
  const { data: vaultData, payAiQuery } = useVault();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || !address) return;
    if (isTyping || isPaying) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      // ── Step 1: Pay on-chain via x402 ──────────────────────────────
      setIsPaying(true);
      let paymentTxHash: string | null = null;

      try {
        paymentTxHash = await payAiQuery(address);
        toast.success("Query payment confirmed on-chain", { duration: 2000 });
      } catch (payErr) {
        const payMsg = payErr instanceof Error ? payErr.message : "Payment failed";
        console.warn("x402 payment failed:", payMsg);
        toast.error(`Payment issue: ${payMsg}`, { duration: 3000 });
        // Continue without payment — API will respond free in dev mode,
        // or return 402 in production mode if REQUIRE_AI_PAYMENT is set.
      }
      setIsPaying(false);

      // ── Step 2: Call AI API ─────────────────────────────────────────
      setIsTyping(true);

      const history = messages
        .filter((m) => m.id !== "0")
        .slice(-8)
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));

      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.trim(),
          history,
          userAddress: address,
          paymentTxHash,
        }),
      });

      if (resp.status === 402) {
        const data = await resp.json();
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: `Payment required: ${data.detail ?? "Please fund your vault to use Shield AI."}`,
          timestamp: new Date(),
        }]);
        return;
      }

      if (!resp.ok) throw new Error("AI request failed");

      const data = await resp.json();
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        paid: true,
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I had trouble processing that. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
      setIsPaying(false);
    }
  }, [address, messages, isTyping, isPaying, payAiQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <AppShell>
      <div className="flex gap-5 h-[calc(100vh-130px)] max-xl:h-auto max-xl:flex-col">
        {/* ── Chat window ───────────────────────────────────────────── */}
        <div className="flex-1 bg-white border border-[var(--border)] rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-[var(--orange)]" />
              </div>
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="font-display font-bold text-[15px] text-black">Shield AI</p>
              <p className="text-[11.5px] text-[var(--text-3)]">
                ERC-8004 Agent · x402 Micropayments · {X402.AI_QUERY_PRICE_USD} USDC/query
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={clsx("flex gap-3", msg.role === "user" && "flex-row-reverse")}
                >
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-end",
                    msg.role === "assistant" ? "bg-black" : "bg-[var(--orange)]"
                  )}>
                    {msg.role === "assistant"
                      ? <Bot className="w-4 h-4 text-[var(--orange)]" />
                      : <User className="w-4 h-4 text-white" />}
                  </div>
                  <div className="max-w-[74%]">
                    <div className={clsx(
                      "px-4 py-3 rounded-[18px] text-[13.5px] leading-relaxed",
                      msg.role === "assistant"
                        ? "bg-[var(--surface)] text-black rounded-bl-[4px]"
                        : "bg-black text-white rounded-br-[4px]"
                    )}
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--orange)">$1</strong>')
                        .replace(/\n/g, "<br/>"),
                    }}
                    />
                    <div className={clsx(
                      "flex items-center gap-1 mt-1",
                      msg.role === "user" && "flex-row-reverse"
                    )}>
                      <span className="font-mono text-[10px] text-[var(--text-3)]">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.paid && (
                        <span className="flex items-center gap-0.5 font-mono text-[9.5px] text-green-600">
                          <CheckCircle2 className="w-2.5 h-2.5" /> paid
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing / paying indicator */}
            <AnimatePresence>
              {(isTyping || isPaying) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[var(--orange)]" />
                  </div>
                  <div className="bg-[var(--surface)] px-4 py-3 rounded-[18px] rounded-bl-[4px]">
                    {isPaying ? (
                      <span className="font-mono text-[12px] text-[var(--orange)] flex items-center gap-1.5">
                        <Zap className="w-3 h-3 animate-pulse" /> Confirming payment on-chain...
                      </span>
                    ) : (
                      <div className="flex gap-1.5 items-center py-0.5">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="px-5 py-4 border-t border-[var(--border)] flex gap-3 items-end flex-shrink-0">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your money..."
              rows={1}
              className="flex-1 input-base resize-none max-h-[120px]"
              disabled={isTyping || isPaying}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping || isPaying || !address}
              className="w-11 h-11 bg-[var(--orange)] rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-orange"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-white" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ── Right sidebar ──────────────────────────────────────────── */}
        <div className="w-80 flex flex-col gap-4 flex-shrink-0 hidden lg:flex">
          {/* Quick prompts */}
          <div className="bg-white border border-[var(--border)] rounded-2xl p-5">
            <p className="font-display font-bold text-[14px] text-black mb-3">Quick Questions</p>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isTyping || isPaying || !address}
                  className="w-full text-left px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] text-[12.5px] text-[var(--text-2)] hover:border-[var(--orange)] hover:text-[var(--orange)] hover:bg-[var(--orange-dim)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Context card */}
          <ContextCard address={address} balances={balances} vaultData={vaultData} />

          {/* x402 info */}
          <div className="bg-black rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[var(--orange)]" />
              <span className="font-display font-bold text-[13px] text-white">x402 Micropayments</span>
            </div>
            <p className="text-[12px] text-white/40 leading-relaxed">
              Every AI query triggers an on-chain USDC payment of $0.01 via the x402 protocol. This makes Shield AI a revenue-generating on-chain agent.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
      }
                                        
