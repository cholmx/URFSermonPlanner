/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#3F3F3F',
        mint: '#95BDAA',
        ember: '#FF854F',
        butter: '#FFE599',
      },
      fontFamily: {
        viga: ['Viga', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
