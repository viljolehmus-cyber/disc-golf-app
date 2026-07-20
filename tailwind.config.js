/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        app: "var(--c-bg)",
        card: "var(--c-card)",
        card2: "var(--c-card2)",
        accent: "var(--c-accent)",
        "accent-hi": "var(--c-accent-hi)",
        "accent-press": "var(--c-accent-press)",
        ink: "var(--c-ink)",
        sub: "var(--c-sub)",
        sep: "var(--c-sep)",
        birdie: "#30D158",
        parc: "#8E8E93",
        bogey: "#FF9F0A",
        dbl: "#FF453A"
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "Segoe UI",
          "sans-serif"
        ]
      },
      borderRadius: {
        card: "16px",
        cell: "12px"
      }
    }
  },
  plugins: []
};
