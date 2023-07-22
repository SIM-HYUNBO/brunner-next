`use strict`

import dotenv from 'dotenv'
import "react-chatbot-kit/build/main.css";
import '@/styles/globals.css'
import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'
import * as  firebase from './../components/notification/firebase';

// Entry Point
export default function App({ Component, pageProps }) {
  dotenv.config();

  useEffect(() => {
    firebase.initializeFirebase();
    firebase.askForPermissionToReceiveNotifications();

  }, []);

  return (
    <div>
      <ThemeProvider attribute='class'>
        <Component {...pageProps} />
      </ThemeProvider>

    </div>
  );
}
