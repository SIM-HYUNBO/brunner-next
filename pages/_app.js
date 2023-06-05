import dotenv from 'dotenv'
import '@/styles/globals.css'
import styles from '../styles/signin.css'
import { ThemeProvider } from 'next-themes'

export const signinCss = styles;
export default function App({ Component, pageProps }) {
  dotenv.config();
  // console.log(`process.env:${JSON.stringify(process.env)}`);
  
  return  (
    <div>
      <ThemeProvider attribute='class'>
       <Component {...pageProps} />
      </ThemeProvider>

      <style global jsx>{`
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div {
          height: 100%;
        }
      `}</style>
  </div>
  );
}
