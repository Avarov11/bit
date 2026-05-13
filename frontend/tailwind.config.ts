import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        chocolate: {
          DEFAULT: "#993040",
          dark: "#800020",
          medium: "#A05068",
          light: "#F5D0D8",
        },
        burgundy: {
          DEFAULT: "#993040",
          dark: "#800020",
          medium: "#A05068",
          light: "#F5D0D8",
        },
        blush: "#FF6B9D",
        gold: {
          DEFAULT: "#FF6B9D",
          light: "#FFB3CC",
          dark: "#2D000A",
        },
        caramel: "#A05068",
        mint: "#A8E6CF",
        cream: {
          DEFAULT: "#FFFFFF",
          dark: "#F5D0D8",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        arabic: ["var(--font-cairo)", "Cairo", "sans-serif"],
      },
      boxShadow: {
        "warm-xs": "0 1px 4px 0 rgba(128, 0, 32, 0.06)",
        "warm-sm": "0 2px 8px 0 rgba(128, 0, 32, 0.08)",
        warm: "0 4px 16px 0 rgba(128, 0, 32, 0.10)",
        "warm-md": "0 8px 24px 0 rgba(128, 0, 32, 0.14)",
        "warm-lg": "0 16px 40px 0 rgba(128, 0, 32, 0.18)",
        "warm-xl": "0 24px 64px 0 rgba(128, 0, 32, 0.22)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(22px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.75s ease-out both",
        "fade-up-d1": "fadeUp 0.75s ease-out 0.12s both",
        "fade-up-d2": "fadeUp 0.75s ease-out 0.24s both",
        "fade-up-d3": "fadeUp 0.75s ease-out 0.38s both",
      },
    },
  },
  plugins: [],
};
export default config;
