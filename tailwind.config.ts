import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          green: '#006747',      // Primary
          yellow: '#EEF578',     // Secondary
          mint: '#D1EFE4',       // Background accent
        },
        primary: {
          50: '#E6F2ED',
          100: '#CCE5DB',
          200: '#99CBB7',
          300: '#66B193',
          400: '#33976F',
          500: '#006747',  // Brand Green
          600: '#00523A',
          700: '#003E2C',
          800: '#00291E',
          900: '#00150F',
        },
        secondary: {
          50: '#FCFDE6',
          100: '#F9FBCC',
          200: '#F3F799',
          300: '#EEF578',  // Brand Yellow
          400: '#DDE84D',
          500: '#CCDB2C',
          600: '#A8B525',
          700: '#848F1E',
          800: '#606917',
          900: '#3C4310',
        },
        mint: {
          50: '#F5FBF8',
          100: '#D1EFE4',  // Brand Light Mint
          200: '#A3DFC9',
          300: '#75CFAE',
          400: '#47BF93',
          500: '#1AAF78',
          600: '#158C60',
          700: '#106948',
          800: '#0A4630',
          900: '#052318',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
