import '@/styles/globals.css'
import styles from '../styles/signin.css'
import { ThemeProvider } from 'next-themes'

export const signinCss = styles;

export default function App({ Component, pageProps }) {

  return  (
    <ThemeProvider attribute='class'>
       <Component {...pageProps} />
    </ThemeProvider>
  );
}
