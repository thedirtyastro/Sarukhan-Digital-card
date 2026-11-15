import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#050608',
        charcoal: '#0A0C10',
        graphite: '#141820',
        gunmetal: '#292F38',
        gold: { DEFAULT: '#B49A62', deep: '#806B43' },
        ivory: '#E5DFD1',
        muted: '#858B96',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
