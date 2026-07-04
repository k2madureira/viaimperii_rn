/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FCECEF',
          100: '#F8D7DD',
          200: '#F1AEBB',
          300: '#E97A94',
          400: '#D94C6E',
          500: '#9E1B32', // Imperial Red
          600: '#86172B',
          700: '#6D1223',
          800: '#540D1A',
          900: '#3B0812',
        },
        accent: {
          50: '#FCF7E8',
          100: '#F8EDC2',
          200: '#F1DB86',
          300: '#E9C84D',
          400: '#DEB72D',
          500: '#D4AF37', // Imperial Gold
          600: '#B28F1E',
          700: '#8E7116',
          800: '#6B5510',
          900: '#4A3B0B',
        },
        success: '#2F7A52',
        warning: '#E6A23C',
        error: '#D64545',
        info: '#3B82F6',

        background: '#FFFFFF',
        surface: '#FAFAFA',
        card: '#FFFFFF',

        border: '#E5E7EB',
        divider: '#F1F5F9',

        text: {
          primary: '#121212',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
          inverse: '#FFFFFF',
        },
        laurel: '#2F7A52', // verde-louro — sucesso/conclusão
        charcoal: '#121212', // charcoal black
        lightgray: '#EAEAEA', // light gray
      },
    },
  },
  plugins: [],
};
