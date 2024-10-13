`use strict`

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes'
import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'
import TickerInfoContent from './content/tickerInfoContent'

export default function TickerInfo() {
  useEffect(() => {
    setThemeRef(themeRef.current);
  }, []);

  // theme : 현재값 가져오기 getter
  // setTheme : 현재값 바꾸기 setter
  const { theme, setTheme } = useTheme()
  const themeRef = useRef(theme);

  const setThemeRef = (newValue) => {
    themeRef.current = newValue;
    setTheme(newValue);
  };

  const router = useRouter();
  const { tickerCode } = router.query;

  return (
    <Layout>
      <Head>
        <title>Stock Quotes and Investment Information - Brunner-Next</title>
        <meta name="description" content="Brunner-Next provides real-time stock quotes. Make effective investments with real-time stock charts, investment strategies, stock news, and stock analysis tools."></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
        <link></link>
      </Head>
      <BodySection>
        <TickerInfoContent tickerCode={tickerCode}></TickerInfoContent>
      </BodySection>
    </Layout>
  );
}