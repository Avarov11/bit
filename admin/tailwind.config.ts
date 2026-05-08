import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fdf6f0",
          100: "#f5e6da",
          500: "#c896a0",
          700: "#3d0a14",
          900: "#2d0810",
        },
      },
    },
  },
  plugins: [],
};

export default config;
