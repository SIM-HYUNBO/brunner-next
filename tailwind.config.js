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
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      mobile: '320px',
      tablet: '600px',// 신규 추가
      laptop: '1200px',// 신규 추가 
      desktop: '1536px', // 신규 추가 == 2xl
    }
  },
  plugins: [],

}
