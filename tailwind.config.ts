import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy brand color (safety net for admin/legacy flows)
        brand: {
          DEFAULT: '#212529',
          dark: '#16181d',
        },
        // Semantic tokens driven by CSS variables (auto-switch in dark mode)
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          strong: 'var(--accent-strong)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: 'var(--radius)',
        lg: 'var(--radius-sm)',
      },
      maxWidth: {
        '7xl': '1200px',
      },
      boxShadow: {
        soft: 'var(--shadow)',
        lift: 'var(--shadow-lg)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
