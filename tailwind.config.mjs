/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // Naturide brand palette
        forest: {
          50: '#f1f7f0',
          100: '#dfecdc',
          200: '#bed9ba',
          300: '#94be8d',
          400: '#6ca05f',
          500: '#4f8743',
          600: '#3c6c33',
          700: '#30572b',
          800: '#284625',
          900: '#223a20',
          950: '#0f1f0e',
        },
        sand: {
          50: '#fbf9f4',
          100: '#f4efe1',
          200: '#e8debf',
          300: '#dac795',
          400: '#cdb170',
          500: '#c19c54',
          600: '#a9803f',
          700: '#876133',
          800: '#6e4f2d',
          900: '#5a4127',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
