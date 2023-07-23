`use strict`

import dotenv from 'dotenv'
import "react-chatbot-kit/build/main.css";
import '@/styles/globals.css'
import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'
import * as  firebase from './../components/notification/firebase'
import RequestServer from './../components/requestServer'

// Entry Point
export default function App({ Component, pageProps }) {
  dotenv.config();

  useEffect(() => {
    firebase.initializeFirebase();
    firebase.askForPermissionToReceiveNotifications().then((token) => {
      if (process.env.userInfo) {
        process.env.userInfo.USER_TOKEN = token;
        updateUserToken(process.env.userInfo);
      }
    })
  }, []);

  var updateUserToken = (userInfo) => {
    RequestServer("POST",
      `{"commandName": "security.updateUserToken",
                    "userId": "${userInfo.USER_ID}",
                    "userToken": "${userInfo.USER_TOKEN}"}`).then((result) => {
        if (result.error_code == 0) {
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        } else {
          alert(JSON.stringify('failed to update user token:' + result.error_message));
        }
      });
  }

  return (
    <div>
      <ThemeProvider attribute='class'>
        <Component {...pageProps} />
      </ThemeProvider>

    </div>
  );
}
