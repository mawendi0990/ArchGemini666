/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          gray: {
            50: '#F5F5F7',  // Apple background
            100: '#E5E5E5',
            200: '#D4D4D8', // Zinc-300ish
            300: '#A1A1AA', // Zinc-400
            400: '#71717A', // Zinc-500
            500: '#52525B', // Zinc-600
            600: '#3F3F46', // Zinc-700
            700: '#27272A', // Zinc-800
            800: '#18181B', // Zinc-900
            900: '#09090B', // Zinc-950
            950: '#000000',
          },
          blue: '#2997FF', // Saturated Apple Blue
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "San Francisco",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif"
        ],
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
