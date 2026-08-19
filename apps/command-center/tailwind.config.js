/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0B0F17',
          card: '#111827',
          border: '#1F2937',
          accent: '#3B82F6',
          glow: '#00F0FF'
        }
      }
    },
  },
  plugins: [],
}
