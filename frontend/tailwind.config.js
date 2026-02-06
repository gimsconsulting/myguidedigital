/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#A855F7', // Purple
          dark: '#9333EA', // Darker purple
          light: '#C084FC', // Light purple
          pink: '#EC4899', // Pink
          'purple-500': '#A855F7',
          'purple-600': '#9333EA',
          'purple-700': '#7E22CE',
          'pink-500': '#EC4899',
          'pink-600': '#DB2777',
        },
        dark: {
          DEFAULT: '#0F0F1E',
          light: '#1A1A2E',
          lighter: '#2D2D44',
        },
      },
      backgroundImage: {
        'gradient-purple-pink': 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
        'gradient-purple-pink-dark': 'linear-gradient(135deg, #9333EA 0%, #DB2777 100%)',
        'gradient-radial': 'radial-gradient(circle, #A855F7 0%, #EC4899 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
