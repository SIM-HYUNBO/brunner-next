`use strict`

import Layout from '../components/layout'
import Head from 'next/head'
import BodySection from '../components/bodySection'
import React from 'react';
import { useEffect } from 'react'
import Script from 'next/script';

import * as userInfo from './../components/userInfo'
import HomeContent from './mainPages/content/homeContent'
import AssetContent from './mainPages/content/assetContent'
import StockContent from './mainPages/content/stockContent'

// Home 페이지
export default function Home() {

  useEffect(() => {

  }, []);

  const GoogleScript = () => {
    return (
      <>
        {/* 광고 스크립트 로드 */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3879149687745447"
          strategy="afterInteractive"
          onLoad={() => {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }}
        />

        {/* 광고 단위 생성 */}
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-3879149687745447"
          data-ad-slot="5669803344"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>

        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-3879149687745447"
          data-ad-slot="5876281933"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>

        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-3879149687745447"
          data-ad-slot="6930914120"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>

        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="fluid"
          data-ad-layout-key="-6t+ed+2i-1n-4w"
          data-ad-client="ca-pub-3879149687745447"
          data-ad-slot="5426260766"></ins>

        <ins className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-3879149687745447"
          data-ad-slot="2851234162"></ins>

        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="autorelaxed"
          data-ad-client="ca-pub-3879149687745447"
          data-ad-slot="7911989152"></ins>
      </>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Brunner Home</title>
        <meta name="description" content="Stock Charts and Market Analysis, Asset Management"></meta>
        <meta name="keywords" content="Stock, Chart, Asset, Investment" />
        <meta rel="icon" href="/brunnerLogo.png"></meta>
        <meta name="google-adsense-account" content="ca-pub-3879149687745447"></meta>
        <GoogleScript />
      </Head>
      <BodySection>
        <div className="container mx-auto flex px-5 md:flex-row flex-col items-center">
          <HomeContent></HomeContent>
        </div>
        {(userInfo.isLogin()) &&
          <div className="container mx-auto flex px-5 md:flex-row flex-col items-left ">
            <div className="container mx-auto flex px-5 md:flex-row flex-col items-center">
              <AssetContent></AssetContent>
            </div>
          </div>
        }
        <div className="container mx-auto flex px-5 md:flex-row flex-col items-center">
          <StockContent></StockContent>
        </div>
      </BodySection>
    </Layout>
  )
}
