/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0a0f0d',
        'bg-light': '#ffffff',
        'accent': '#3D5A52',
        'accent-mid': '#5a8a7a',
        'accent-pale': '#f0f5f3',
        'text-main': '#1a1a1a',
        'text-muted': '#64748b',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      letterSpacing: {
        'widest-xl': '0.5em',
        'widest-2xl': '0.8em',
      }
    },
  },
  plugins: [],
}
