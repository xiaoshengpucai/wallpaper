/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        xingkai: [
          'STXingkai',
          '华文行楷',
          'STKaiti',
          'Xingkai SC',
          'Xingkai TC',
          'KaiTi',
          'Kaiti SC',
          '楷体',
          'serif',
        ],
      },
    },
    screens: {
      nav: '900px',
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}

