/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', "sans-serif"],
        sans: ['"IBM Plex Sans KR"', "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f4f7f6",
          100: "#e3ebe8",
          200: "#c5d6d0",
          700: "#2a3f38",
          800: "#1a2b25",
          900: "#0f1a16",
        },
        accent: {
          DEFAULT: "#0d9488",
          soft: "#ccfbf1",
          dark: "#0f766e",
        },
        signal: {
          green: "#16a34a",
          amber: "#d97706",
          red: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};
