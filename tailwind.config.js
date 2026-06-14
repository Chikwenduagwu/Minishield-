/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#F07300",
          light: "#FF8C1A",
          dim: "rgba(240,115,0,0.10)",
          glow: "rgba(240,115,0,0.22)",
        },
        surface: {
          DEFAULT: "#f8f8f8",
          2: "#f2f2f2",
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "20px",
        xl: "16px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.07)",
        "card-lg": "0 16px 48px rgba(0,0,0,0.10)",
        orange: "0 8px 24px rgba(240,115,0,0.35)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "blob-float": "blobFloat 14s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
        ticker: "ticker 28s linear infinite",
        "bar-fill": "barFill 1.4s cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(22px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blobFloat: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(25px,-25px) scale(1.04)" },
          "66%": { transform: "translate(-18px,18px) scale(0.96)" },
        },
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        barFill: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
    },
  },
  plugins: [],
};
