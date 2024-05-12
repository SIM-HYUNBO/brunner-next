`use strict`

import dotenv from 'dotenv'
import '@/styles/globals.css'
import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'

// Entry Point
export default function App({ Component, pageProps }) {
  dotenv.config();
  let messaging;

  useEffect(() => {
  }, []);

  return (
    <div>
      <ThemeProvider attribute='class'>
        <Component {...pageProps} />
      </ThemeProvider>

    </div>
  );
}
