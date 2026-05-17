import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" }
    },
    extend: {
      colors: {
        bg: {
          base: "var(--bg-base)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)"
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          glow: "var(--accent-glow)"
        },
        field: "var(--field-border)",
        ink: {
          DEFAULT: "var(--text-primary)",
          muted: "var(--text-secondary)",
          dim: "var(--text-tertiary)"
        },
        line: "var(--border-subtle)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      },
      fontSize: {
        hero: ["4rem", { lineHeight: "1.05", fontWeight: "700", letterSpacing: "-0.02em" }],
        h1: ["3rem", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" }],
        h2: ["2rem", { lineHeight: "1.2", fontWeight: "600", letterSpacing: "-0.01em" }]
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1.25rem",
        pill: "999px"
      },
      boxShadow: {
        card: "0 8px 32px rgba(0,0,0,0.4)",
        glow: "0 40px 80px -20px rgba(77,155,255,0.4)",
        "glow-cyan": "0 40px 80px -20px rgba(0,212,255,0.35)",
        "glow-field": "0 0 0 1px rgba(255,214,0,0.6), 0 0 40px rgba(255,214,0,0.25)"
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pulse-glow": {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        },
        grid: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(40px)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.4,0,0.2,1) both",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        grid: "grid 8s linear infinite"
      }
    }
  },
  plugins: [animate]
};

export default config;
