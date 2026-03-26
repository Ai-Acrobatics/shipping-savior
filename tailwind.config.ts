import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          50: "#e7f0ff",
          100: "#c4d9ff",
          200: "#90b3ff",
          300: "#5c8dff",
          400: "#2867ff",
          500: "#0048e5",
          600: "#003ab8",
          700: "#002c8a",
          800: "#001e5c",
          900: "#04132b",
          950: "#020a17",
        },
        ocean: {
          50: "#e6fbff",
          100: "#b3f3ff",
          200: "#80ebff",
          300: "#4de3ff",
          400: "#1adbff",
          500: "#00bcd4",
          600: "#0097a7",
          700: "#00727a",
          800: "#004d4d",
          900: "#002929",
        },
        cargo: {
          50: "#fff8e6",
          100: "#ffecb3",
          200: "#ffe080",
          300: "#ffd44d",
          400: "#ffc81a",
          500: "#e6a800",
          600: "#b38300",
          700: "#805e00",
          800: "#4d3800",
          900: "#1a1300",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.6s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
