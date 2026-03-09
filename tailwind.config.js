/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // ← this scans your JSX files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}