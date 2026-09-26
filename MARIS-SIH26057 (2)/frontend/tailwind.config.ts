import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          abyss: '#060a12',
          surface: '#0a1120',
          card: '#0d1627',
          hover: '#121d33',
        },
        phosphor: {
          cyan: '#00f0ff',
          teal: '#0ac5b2',
          amber: '#f59e0b',
          red: '#ff3b5c',
        },
        border: {
          hairline: '#182844',
          subtle: '#0f1c30',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
