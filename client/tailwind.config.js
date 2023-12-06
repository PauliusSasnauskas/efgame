/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        grey: {
          lighter: '#82806C',
          light: '#404040',
          medium: '#404040',
          dark: '#3e3c32',
          darker: '#1e1e1e',
          darkest: '#151619'
        }
      },
      spacing: {
        0.25: '0.0625rem',
        5.5: '1.375rem',
        6.5: '1.625rem',
        9.5: '2.375rem',
        10.5: '2.625rem',
        30: '7.5rem',
        62: '15.5rem',
        180: '45rem',
        240: '60rem'
      },
      fontFamily: {
        nokiafc22: 'nokiafc22'
      },
      minWidth: {
        56: '14rem'
      },
      minHeight: {
        180: '45rem',
      },
      borderWidth: {
        6: '6px'
      }
    }
  },
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('slider-thumb', ['&::-webkit-slider-thumb', '&::slider-thumb', '&::-moz-range-thumb'])
    })
  ]
}
