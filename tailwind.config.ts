import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 仙路品牌主色（可改成你喜欢的颜色）
        brand: {
          DEFAULT: '#1d4ed8',
          dark: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
