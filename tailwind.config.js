/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#9E1B32', // imperial red
        gold: '#D4AF37', // imperial gold — destaques/recompensas
        laurel: '#2F7A52', // verde-louro — sucesso/conclusão
        charcoal: '#121212', // charcoal black
        lightgray: '#EAEAEA', // light gray
      },
    },
  },
  plugins: [],
};
