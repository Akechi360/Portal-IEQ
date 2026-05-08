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
        brand: {
          50: "#eef9ff",
          100: "#d8efff",
          200: "#b8e3ff",
          300: "#86d2ff",
          400: "#4bb7ff",
          500: "#2199f3",
          600: "#0f7acd",
          700: "#1062a6",
          800: "#145387",
          900: "#16466f"
        },
        clinic: {
          mint: "#2fbca3"
        }
      }
    }
  },
  plugins: []
};

export default config;
