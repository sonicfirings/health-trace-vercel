import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090909",
        foreground: "#f7f7f2",
        trace: {
          green: "#9DFF7A",
          deep: "#183F22",
          mist: "#D9FFD0",
          dim: "#5D7A63",
        },
        border: "rgba(255,255,255,0.1)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0, 0, 0, 0.42)",
        glow: "0 0 64px rgba(157, 255, 122, 0.12)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" },
        },
        pulseLine: {
          "0%": { opacity: "0.24", transform: "scaleX(0.72)" },
          "50%": { opacity: "0.74", transform: "scaleX(1)" },
          "100%": { opacity: "0.24", transform: "scaleX(0.72)" },
        },
      },
      animation: {
        drift: "drift 7s ease-in-out infinite",
        pulseLine: "pulseLine 3.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
