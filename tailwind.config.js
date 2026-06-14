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
        surface: { DEFAULT: "#f8f8f8", 2: "#f2f2f2" },
      },
      fontFamily: {
        // Single unified system stack — matches CSS variable
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "var(--font-dm-mono)",
          "'SFMono-Regular'",
          "Consolas",
          "'Liberation Mono'",
          "Menlo",
          "monospace",
        ],
        // Keep display alias pointing to same stack
        display: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
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
      spacing: {
        safe: "env(safe-area-inset-bottom, 0px)",
      },
    },
  },
  plugins: [],
};
