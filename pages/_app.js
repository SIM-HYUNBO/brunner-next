`use strict`

import dotenv from 'dotenv'
import '@/styles/globals.css'
import { ThemeProvider } from 'next-themes'
import requestServer from './../components/requestServer'
import { useEffect } from 'react'

// Entry Point
export default function App({ Component, pageProps }) {
  useEffect(() => {

    var reqData = {};
    reqData.commandName = "serviceSQL.loadAllSQL";

    requestServer('POST', JSON.stringify(reqData)).then((result) => {
      if (result.error_code < 0) // 에러
        alert(`${result.error_message}`);
    });
  }, []);

  dotenv.config();

  return (
    <div>
      <ThemeProvider attribute='class'>
        <Component {...pageProps} />
      </ThemeProvider>

    </div>
  );
}
