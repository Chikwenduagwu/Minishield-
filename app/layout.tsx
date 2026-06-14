import type { Metadata, Viewport } from "next";
import { Inter, DM_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://minishield.vercel.app"),
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
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable}`}>
      <body className="antialiased bg-white text-black">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
