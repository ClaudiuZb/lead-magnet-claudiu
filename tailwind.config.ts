import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        geist: ['Geist', 'Inter', 'sans-serif'],
      },
      colors: {
        'membrane-dark': '#03030D',
        'membrane-gray': '#6B7280',
        'membrane-bg': '#F8F9FA',
        'membrane-border': '#DFE0EB',
      },
    },
  },
  plugins: [],
};
export default config;
