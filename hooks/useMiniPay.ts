"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { formatUnits } from "viem";
import { erc20Abi } from "viem";
import { isMiniPay, getPublicClient, getWalletClient, getAllBalances } from "@/lib/viem";
import { TOKENS, DEEPLINKS } from "@/lib/constants";

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

export function useMiniPay(): WalletState {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMP, setIsMP] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState({
    USDm: "0",
    USDC: "0",
    USDT: "0",
    totalUsd: 0,
  });
  const initialized = useRef(false);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    try {
      const { tokens, totalUsd } = await getAllBalances(address);
      setBalances({
        USDm: tokens.find((t) => t.symbol === "USDm")?.formatted ?? "0",
        USDC: tokens.find((t) => t.symbol === "USDC")?.formatted ?? "0",
        USDT: tokens.find((t) => t.symbol === "USDT")?.formatted ?? "0",
        totalUsd,
      });
    } catch (err) {
      console.error("Balance refresh failed:", err);
    }
  }, [address]);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("No wallet detected. Open this app in MiniPay.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const mp = isMiniPay();
      setIsMP(mp);

      const walletClient = getWalletClient();
      const [addr] = await walletClient.getAddresses();

      if (!addr) {
        setError("No accounts found.");
        setIsLoading(false);
        return;
      }

      setAddress(addr);
      setIsConnected(true);

      // Load balances
      const { tokens, totalUsd } = await getAllBalances(addr);
      setBalances({
        USDm: tokens.find((t) => t.symbol === "USDm")?.formatted ?? "0",
        USDC: tokens.find((t) => t.symbol === "USDC")?.formatted ?? "0",
        USDT: tokens.find((t) => t.symbol === "USDT")?.formatted ?? "0",
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

  // Refresh balances every 30s when connected
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(refreshBalances, 30_000);
    return () => clearInterval(interval);
  }, [isConnected, refreshBalances]);

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
