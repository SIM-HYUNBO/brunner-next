`use strict`

import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'
import React from 'react';
import { useEffect } from 'react'
import Script from 'next/script';

import * as userInfo from '@/components/userInfo'
import HomeContent from '@/pages/mainPages/content/homeContent'
import StockContent from '@/pages/mainPages/content/stockContent'
import BrunnerVideo from '@/components/brunnerVideo'

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
        <StockContent></StockContent>
        <div className="lg:h-2/6 lg:w-2/6 mt-10">
          <BrunnerVideo
            url={'https://www.youtube.com/watch?v=5nRs1niZ9h4&list=PLqb1KKjbyLLjjsGoYF9KlogyNIF3KDo0Z'}
            title={'사마의-미완의 책사'}
            width="800px" // 100%
            height="450px"// 100%
            className="mt-2"
          >
          </BrunnerVideo>
          <BrunnerVideo
            url={'https://www.youtube.com/watch?v=UOmp8Zbvs7k&list=PLqb1KKjbyLLiVTGRO7cB_3PsbmbBRAvCj'}
            title={'사마의-최후의 승자'}
            width="800px" // 100%
            height="450px"
            className="mt-5" // 100%
          >
          </BrunnerVideo>
        </div>
      </BodySection>
    </Layout>
  )
}
