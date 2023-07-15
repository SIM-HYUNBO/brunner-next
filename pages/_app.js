import dotenv from 'dotenv'
import "react-chatbot-kit/build/main.css";
import '@/styles/globals.css'

import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'
import isJson from './../pages/util';

// Entry Point
export default function App({ Component, pageProps }) {
  dotenv.config();

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
