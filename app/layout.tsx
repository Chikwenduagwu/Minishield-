import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MiniShield — Protect Your Money From Inflation",
  description:
    "MiniShield combines stablecoin savings, smart remittance scheduling, and AI-powered financial management. Built on Celo, powered by MiniPay.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://minishield.xyz"),
  openGraph: {
    title: "MiniShield",
    description: "Protect your money from inflation while supporting loved ones.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-body antialiased bg-white text-black">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              borderRadius: "12px",
              background: "#0a0a0a",
              color: "#fff",
            },
            success: {
              iconTheme: { primary: "#F07300", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
