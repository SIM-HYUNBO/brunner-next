/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    screens: { // 아래의 값들은 min-width이다.
      // mobile: '360px', // 모바일 (default)
      xs: '360px',
      sm: '640px',
      md: '768px',
      tablet: '768px',// 신규 추가
      lg: '1024px',
      desktop: '1024px', // 신규 추가 == 2xl
      xl: '1280px',
      laptop: '1200px',// 신규 추가 
    }
  },
  plugins: [],

}
