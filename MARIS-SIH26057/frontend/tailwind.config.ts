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
          deep: '#070a0f',
          surface: '#0b1018',
          raised: '#101622',
          subtle: '#161e2e',
        },
        signal: {
          vermilion: '#d93829',
          amber: '#d99b26',
          sage: '#5b937c',
          marine: '#3b7b99',
        },
        rule: {
          hairline: 'rgba(226, 232, 228, 0.08)',
          active: 'rgba(226, 232, 228, 0.18)',
          strong: 'rgba(226, 232, 228, 0.35)',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
        editorial: ['Newsreader', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
