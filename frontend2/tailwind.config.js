/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map to CSS tokens - DON'T duplicate values
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-hover)',
        surface: 'var(--color-surface)',
        'header-bg': 'var(--color-header-bg)',
        'background-light': 'var(--color-background)',
        'background-dark': 'var(--color-dark-bg)',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // We use globals.scss instead
  },
};

