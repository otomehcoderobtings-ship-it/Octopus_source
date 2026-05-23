/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
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
      colors: {
        ink: "#05070d",
        ocean: "#071424",
        violet: "#7c3cff",
        cyan: "#35d8ff",
        mint: "#64ffd8",
      },
      boxShadow: {
        glow: "0 0 32px rgba(53, 216, 255, 0.18)",
        violet: "0 0 40px rgba(124, 60, 255, 0.18)",
      },
      backgroundImage: {
        "radial-grid":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
