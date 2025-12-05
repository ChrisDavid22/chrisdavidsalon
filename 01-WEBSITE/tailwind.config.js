/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./services/*.html",
    "./locations/*.html",
    "./admin/*.html",
    "./js/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'script': ['Dancing Script', 'cursive'],
      },
      colors: {
        'gold': {
          400: '#d4af37',
          500: '#c9a227',
          600: '#b8860b',
        }
      }
    },
  },
  plugins: [],
}
