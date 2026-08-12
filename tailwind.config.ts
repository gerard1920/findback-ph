import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#1e293b",
          800: "#0f172a",
          900: "#0b1220",
        },
        brand: {
          50: "#eef4ff",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        lost: {
          500: "#f43f5e",
          600: "#e11d48",
          50: "#fff1f2",
          100: "#ffe4e6",
        },
        found: {
          500: "#10b981",
          600: "#059669",
          50: "#ecfdf5",
          100: "#d1fae5",
        },
        match: {
          500: "#6366f1",
          600: "#4f46e5",
          50: "#eef2ff",
          100: "#e0e7ff",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
