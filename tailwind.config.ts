import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Marca Clínica IEQ (teal). 500 = teal brillante, 600 = teal profundo.
        primary: {
          50: "#e7f9fa",
          100: "#c5f0f2",
          200: "#98e4e8",
          300: "#5bd3d9",
          400: "#22bcc3",
          500: "#12aeb4",
          600: "#0d6f78",
          700: "#0c5a62",
          800: "#0b4a51",
          900: "#093b41"
        },
        accent: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
          dark: "#059669"
        },
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A"
        },
        surface: "#FFFFFF",
        danger: "#EF4444",
        warning: "#F59E0B",
        success: "#10B981"
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px"
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "Plus Jakarta Sans", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        elevated: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)"
      }
    }
  },
  plugins: []
};

export default config;
