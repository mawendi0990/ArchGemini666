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
            50: '#F5F5F7',
            100: '#E5E5E5',
            200: '#D4D4D8',
            300: '#A1A1AA',
            400: '#71717A',
            500: '#52525B',
            600: '#3F3F46',
            700: '#27272A',
            800: '#18181B',
            900: '#09090B',
            950: '#000000',
          },
          blue: '#2997FF',
        },
        aurora: {
          purple: '#A855F7',
          pink: '#EC4899',
          cyan: '#06B6D4',
          emerald: '#10B981',
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
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(41, 151, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(41, 151, 255, 0.8), 0 0 60px rgba(168, 85, 247, 0.4)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(41, 151, 255, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168, 85, 247, 0.1) 0px, transparent 50%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
