import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bocini-inspired palette
        brand: {
          DEFAULT: '#212529',   // dark navy/black (Bocini header bg)
          light: '#f4f6f8',    // light gray body bg
        },
        accent: {
          DEFAULT: '#0d6efd',   // blue accent (Bocini blue)
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
