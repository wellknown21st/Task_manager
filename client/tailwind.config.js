/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f1419",
        card: "#1a2332",
        accent: "#3b82f6",
        muted: "#94a3b8",
      },
    },
  },
  plugins: [],
};
