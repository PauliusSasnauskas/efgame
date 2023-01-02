/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      spacing: {
        6.5: '1.625rem',
        9.5: '2.375rem',
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
      borderWidth: {
        6: '6px'
      }
    }
  },
  plugins: []
}
