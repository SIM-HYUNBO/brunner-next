`use strict`

import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'
import React from 'react';
import { useEffect } from 'react'
import Script from 'next/script';
import HomeContent from '@/pages/mainPages/content/homeContent'


// Home 페이지
export default function Home() {

  useEffect(() => {

  }, []);

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
    <Layout>
      <Head>
        <title>Stock Quotes and Investment Information - Brunner-Next</title>
        <meta name="description" content="Brunner-Next provides real-time stock quotes. Make effective investments with real-time stock charts, investment strategies, stock news, and stock analysis tools."></meta>
        <meta name="keywords" content="Stock, Stock Quotes, Stock Analysis, US Stock Quotes, Stock Investment, Real-Time Stock Quotes, Stock Analysis Tools, 주식, 주식 시세, 주식 분석, 미국 주식 시세, 주식 투자, 실시간 주식 시세, 주식 종목 분석"></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
        <meta name="google-adsense-account" content="ca-pub-3879149687745447"></meta>
        <GoogleAdScript />
      </Head>
      <BodySection>
        <HomeContent></HomeContent>
        {/* <StockContent></StockContent> */}
      </BodySection>
    </Layout>
  )
}
