`use strict`

import dotenv from 'dotenv'
import '@/styles/globals.css'
import { ThemeProvider } from 'next-themes'
import requestServer from './../components/requestServer'
import { useEffect } from 'react'

// Entry Point
export default function App({ Component, pageProps }) {
  useEffect(() => {
    requestLoadAllSqls();
  }, []);

  dotenv.config();

  async function requestLoadAllSqls() {
    var jRequest = {};
    var jResponse = null;

    jRequest.commandName = "serviceSQL.loadAllSQL";

    jResponse = await requestServer('POST', JSON.stringify(jRequest));

    if (jResponse.error_code < 0) // 에러
      alert(`${jResponse.error_message}`);
  }


  return (
    <div>
      <ThemeProvider attribute='class'>
        <Component {...pageProps} />
      </ThemeProvider>

    </div>
  );
}
