/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#CC093B',
          'red-dark': '#9C0730',
          orange: '#F18800',
          'orange-dark': '#C46E00',
          ink: '#1A1417',
          'hero-from': '#1D0A10',
          'hero-to': '#3A0A16',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(17, 12, 14, 0.04), 0 4px 16px rgba(17, 12, 14, 0.06)',
        'card-hover': '0 2px 6px rgba(17, 12, 14, 0.08), 0 12px 24px rgba(17, 12, 14, 0.10)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #CC093B 0%, #F18800 100%)',
        'hero-gradient': 'radial-gradient(120% 120% at 10% 0%, #3A0A16 0%, #1D0A10 55%, #120609 100%)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};
