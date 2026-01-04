/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
          contrast: 'var(--color-primary-contrast)',
        },
        overlay: {
          DEFAULT: 'var(--color-overlay)',
          strong: 'var(--color-overlay-strong)',
          soft: 'var(--color-overlay-soft)',
        },
        background: {
          DEFAULT: 'var(--color-bg)',
          light: 'var(--color-bg-light)',
          dark: 'var(--color-bg-dark)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          light: 'var(--color-surface-light)',
          dark: 'var(--color-surface-dark)',
          subtle: 'var(--color-surface-subtle)',
          raised: 'var(--color-surface-raised)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          light: 'var(--color-border-light)',
          dark: 'var(--color-border-dark)',
          strong: 'var(--color-border-strong)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
          text: 'var(--color-success-text)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
          text: 'var(--color-warning-text)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          bg: 'var(--color-error-bg)',
          text: 'var(--color-error-text)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          bg: 'var(--color-info-bg)',
          text: 'var(--color-info-text)',
        },
        footer: {
          bg: 'var(--color-footer-bg)',
          text: 'var(--color-footer-text)',
          muted: 'var(--color-footer-muted)',
          border: 'var(--color-footer-border)',
          input: {
            bg: 'var(--color-footer-input-bg)',
            border: 'var(--color-footer-input-border)',
            placeholder: 'var(--color-footer-input-placeholder)',
          },
        },
        hero: {
          from: 'var(--color-hero-from)',
          via: 'var(--color-hero-via)',
          to: 'var(--color-hero-to)',
          text: 'var(--color-hero-text)',
          muted: 'var(--color-hero-muted)',
          cta: {
            bg: 'var(--color-hero-cta-secondary-bg)',
            hover: 'var(--color-hero-cta-secondary-bg-hover)',
            border: 'var(--color-hero-cta-secondary-border)',
          },
        },
        role: {
          admin: 'var(--color-role-admin-solid)',
          manager: 'var(--color-role-manager-solid)',
          customer: 'var(--color-role-customer-solid)',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

