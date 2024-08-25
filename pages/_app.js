`use strict`

import dotenv from 'dotenv'
import '@/styles/globals.css'
import { ThemeProvider } from 'next-themes'
import requestServer from './../components/requestServer'
import { useEffect, useState } from 'react'
import BrunnerMessageBox from '@/components/BrunnerMessageBox'
import Script from 'next/script';

// Entry Point
export default function App({ Component, pageProps }) {
  useEffect(async () => {
    // await requestLoadAllSqls();
  }, []);

  dotenv.config();

  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  const [modalContent, setModalContent] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => { },
    onClose: () => { }
  });

  // 모달 열기 함수
  const openModal = (message) => {
    return new Promise((resolve, reject) => {
      setModalContent({
        isOpen: true,
        message: message,
        onConfirm: (result) => { resolve(result); closeModal(); },
        onClose: () => { reject(false); closeModal(); }
      });
    });
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalContent({
      isOpen: false,
      message: '',
      onConfirm: () => { },
      onClose: () => { }
    });
  };

  const GoogleAdScript = () => {
    return (
      <>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3879149687745447"
          crossOrigin="anonymous"
        />
        <Script
          async
          custom-element="amp-auto-ads"
          src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js">
        </Script>
      </>
    )
  }

  return (
    <div>
      <BrunnerMessageBox
        isOpen={modalContent.isOpen}
        message={modalContent.message}
        onConfirm={modalContent.onConfirm}
        onClose={modalContent.onClose}
      />

      <ThemeProvider attribute='class'>
        <GoogleAdScript />
        <Component {...pageProps} />
      </ThemeProvider>

    </div>
  );
}
