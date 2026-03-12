/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 🌙 enable dark mode via class
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f0f0f0", // light mode background
        backgroundDark: "#020617", // dark mode background
      },
    },
  },
  plugins: [],
};
