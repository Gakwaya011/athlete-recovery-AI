/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'dark-bg':   '#0f1117',
        'dark-card': '#1e212b',
        primary:     '#22c55e',
        secondary:   '#f97316',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}