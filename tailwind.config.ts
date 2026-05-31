import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#111118",
          card: "#16161f",
          border: "#1e1e2e",
        },
        accent: {
          green: "#00ff88",
          cyan: "#00d4ff",
          purple: "#7c3aed",
          red: "#ff4444",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #00ff8820, 0 0 10px #00ff8810" },
          "100%": { boxShadow: "0 0 20px #00ff8840, 0 0 40px #00ff8820" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
