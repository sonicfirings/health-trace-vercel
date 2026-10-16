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
          green: "#FF7BAC",
          purple: "#836EF9",
          deep: "#21143A",
          mist: "#F0ECFF",
          dim: "#716982",
          amber: "#FFB84D",
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
        glow: "0 0 64px rgba(131, 110, 249, 0.18)",
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
