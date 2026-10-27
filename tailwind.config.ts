import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "420px",
      },
      colors: {
        corporate: {
          bg: "#F7F8FA",
          card: "#FFFFFF",
          muted: "#F1F3F5",
          text: "#1F2937",
          subtext: "#4B5563",
          disabled: "#9CA3AF",
          border: "#E5E7EB",
          primary: "#374151",
          accent: "#2563EB",
          danger: "#B91C1C",
        },
        status: {
          disabled: {
            bg: "#F3F4F6",
            solid: "#9CA3AF",
            text: "#6B7280",
            border: "#D1D5DB",
          },
          pending: {
            bg: "#FEF2F2",
            solid: "#DC2626",
            text: "#991B1B",
            border: "#FCA5A5",
          },
          in_progress: {
            bg: "#FFFBEB",
            solid: "#D97706",
            text: "#92400E",
            border: "#FCD34D",
          },
          completed: {
            bg: "#F0FDF4",
            solid: "#16A34A",
            text: "#166534",
            border: "#86EFAC",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
