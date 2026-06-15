"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { isMiniPay, getPublicClient, getAllBalances } from "@/lib/viem";

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
  const [balances, setBalances]       = useState(EMPTY_BALANCES);
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

    if (typeof window === "undefined" || !window.ethereum) {
      setIsLoading(false);
      return;
    }

    try {
      setIsMP(isMiniPay());

      // MiniPay-compatible: use eth_requestAccounts directly
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];

      const addr = accounts?.[0] as `0x${string}` | undefined;

      if (!addr) {
        setIsLoading(false);
        return;
      }

      setAddress(addr);
      setIsConnected(true);

      // Load balances
      const { tokens, totalUsd } = await getAllBalances(addr);
      setBalances({
        USDm: tokens.find(t => t.symbol === "USDm")?.formatted ?? "0.00",
        USDC: tokens.find(t => t.symbol === "USDC")?.formatted ?? "0.00",
        USDT: tokens.find(t => t.symbol === "USDT")?.formatted ?? "0.00",
        totalUsd,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    connect();
  }, [connect]);

  // Also try to get address from selectedAddress immediately (MiniPay sets this)
  useEffect(() => {
    if (isConnected) return;
    if (typeof window === "undefined" || !window.ethereum) return;

    const selected = window.ethereum.selectedAddress as `0x${string}` | undefined;
    if (selected) {
      setAddress(selected);
      setIsConnected(true);
      setIsMP(isMiniPay());
      getAllBalances(selected).then(({ tokens, totalUsd }) => {
        setBalances({
          USDm: tokens.find(t => t.symbol === "USDm")?.formatted ?? "0.00",
          USDC: tokens.find(t => t.symbol === "USDC")?.formatted ?? "0.00",
          USDT: tokens.find(t => t.symbol === "USDT")?.formatted ?? "0.00",
          totalUsd,
        });
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    }
  }, [isConnected]);

  // Refresh balances every 30s
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(refreshBalances, 30_000);
    return () => clearInterval(interval);
  }, [isConnected, refreshBalances]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        setAddress(null);
        setIsConnected(false);
        setBalances(EMPTY_BALANCES);
      } else {
        const newAddr = accs[0] as `0x${string}`;
        setAddress(newAddr);
        setIsConnected(true);
        getAllBalances(newAddr).then(({ tokens, totalUsd }) => {
          setBalances({
            USDm: tokens.find(t => t.symbol === "USDm")?.formatted ?? "0.00",
            USDC: tokens.find(t => t.symbol === "USDC")?.formatted ?? "0.00",
            USDT: tokens.find(t => t.symbol === "USDT")?.formatted ?? "0.00",
            totalUsd,
          });
        }).catch(() => {});
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  return {
    address,
    isConnected,
    isMiniPay: isMP,
    isLoading,
    error,
    balances,
    refreshBalances,
    connect,
  };
}
