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
        burgundy: {
          DEFAULT: "#800020",
          dark: "#5C0016",
          medium: "#A0002A",
          light: "#F2D9DE",
        },
        blush: "#E8B4BC",
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E8D5A3",
          dark: "#A07C2E",
        },
        cream: {
          DEFAULT: "#FDF6F0",
          dark: "#F5EDE4",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "warm-xs": "0 1px 4px 0 rgba(26, 10, 10, 0.06)",
        "warm-sm": "0 2px 8px 0 rgba(26, 10, 10, 0.08)",
        warm: "0 4px 16px 0 rgba(26, 10, 10, 0.10)",
        "warm-md": "0 8px 24px 0 rgba(26, 10, 10, 0.14)",
        "warm-lg": "0 16px 40px 0 rgba(26, 10, 10, 0.18)",
        "warm-xl": "0 24px 64px 0 rgba(26, 10, 10, 0.22)",
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
