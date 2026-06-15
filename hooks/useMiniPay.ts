"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { isMiniPay, getWalletClient, getAllBalances } from "@/lib/viem";

export type WalletState = {
  address: `0x${string}` | null;
  isConnected: boolean;
  isMiniPay: boolean;
  isLoading: boolean;
  error: string | null;
  balances: {
    USDm: string;
    USDC: string;
    USDT: string;
    totalUsd: number;
  };
  refreshBalances: () => Promise<void>;
  connect: () => Promise<void>;
};

const EMPTY_BALANCES = { USDm: "0.00", USDC: "0.00", USDT: "0.00", totalUsd: 0 };

export function useMiniPay(): WalletState {
  const [address, setAddress]         = useState<`0x${string}` | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMP, setIsMP]               = useState(false);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [balances, setBalances]       = useState({ USDm: "0", USDC: "0", USDT: "0", totalUsd: 0 });
  const initialized                   = useRef(false);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    try {
      const { tokens, totalUsd } = await getAllBalances(address);
      setBalances({
        USDm: tokens.find(t => t.symbol === "USDm")?.formatted ?? "0",
        USDC: tokens.find(t => t.symbol === "USDC")?.formatted ?? "0",
        USDT: tokens.find(t => t.symbol === "USDT")?.formatted ?? "0",
        totalUsd,
      });
    } catch { /* silent */ }
  }, [address]);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // No ethereum provider — not in MiniPay
    if (typeof window === "undefined" || !window.ethereum) {
      setIsLoading(false);
      return;
    }

    try {
      setIsMP(isMiniPay());
      const walletClient = getWalletClient();
      const [addr] = await walletClient.getAddresses();

      if (!addr) {
        setIsLoading(false);
        return;
      }

      setAddress(addr);
      setIsConnected(true);

      const { tokens, totalUsd } = await getAllBalances(addr);
      setBalances({
        USDm: tokens.find(t => t.symbol === "USDm")?.formatted ?? "0",
        USDC: tokens.find(t => t.symbol === "USDC")?.formatted ?? "0",
        USDT: tokens.find(t => t.symbol === "USDT")?.formatted ?? "0",
        totalUsd,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    connect();
  }, [connect]);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(refreshBalances, 30_000);
    return () => clearInterval(interval);
  }, [isConnected, refreshBalances]);

  return { address, isConnected, isMiniPay: isMP, isLoading, error, balances, refreshBalances, connect };
}
