import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f1115",
        panel: "#171a21",
        panel2: "#1f232c",
        border: "#2a2f3a",
        accent: "#6366f1",
        accent2: "#8b5cf6",
        textmain: "#e8eaed",
        textdim: "#9aa1ad",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;