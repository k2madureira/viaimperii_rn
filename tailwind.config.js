/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#8B1A2B', // vinho imperial
        gold: '#D4AF37', // ouro imperial — destaques/recompensas
        laurel: '#2F7A52', // verde-louro — sucesso/conclusão
      },
    },
  },
  plugins: [],
};
