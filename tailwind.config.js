/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F76934',
          dark: '#1A1A1A',
          surface: '#2C2C2C',
        },
        status: {
          success: '#4CAF50',
          error: '#FF6B6B',
          info: '#6366F1',
          warning: '#F59E0B',
        },
        text: {
          primary: '#E5E5E7',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
        border: {
          DEFAULT: '#3A3A3A',
        },
      },
      fontFamily: {
        display: ['Truculenta', 'sans-serif'],
        body: ['Roboto Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
