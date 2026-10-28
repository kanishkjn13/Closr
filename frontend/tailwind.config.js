/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        closr: {
          bg: '#F6F4EC',
          card: '#FCFBF6',
          forest: {
            DEFAULT: '#174F43',
            hover: '#123F36',
            active: '#0E312A',
            subtle: '#EBF3F0',
          },
          text: {
            DEFAULT: '#193B35',
            muted: '#77817A',
            subtle: '#9CA49E',
          },
          sage: {
            DEFAULT: '#E2E9DF',
            light: '#EDF2E9',
            dark: '#C8D5C4',
          },
          pale: '#EDF2E9',
          amber: {
            DEFAULT: '#B77D43',
            light: '#FAF3EA',
            badge: '#F7EEDB',
          },
          border: {
            DEFAULT: '#E6E4DA',
            dark: '#D8D5C9',
          },
          success: {
            DEFAULT: '#2D6A4F',
            bg: '#EDF7F1',
            badge: '#E2F1E8',
          },
          warning: {
            DEFAULT: '#B77D43',
            bg: '#FAF3EA',
            badge: '#F7EEDB',
          },
          danger: {
            DEFAULT: '#B84A39',
            hover: '#A03D2E',
            bg: '#FDF1EF',
            border: '#F4CFC9',
          },
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(25, 59, 53, 0.05), 0 1px 4px -1px rgba(25, 59, 53, 0.03)',
        'card': '0 4px 16px -4px rgba(25, 59, 53, 0.04), 0 1px 3px 0 rgba(25, 59, 53, 0.02)',
        'dropdown': '0 10px 25px -5px rgba(25, 59, 53, 0.08), 0 8px 10px -6px rgba(25, 59, 53, 0.04)',
        'modal': '0 20px 40px -15px rgba(25, 59, 53, 0.15)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
