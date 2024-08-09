`use strict`

import Layout from '../components/layout'
import Head from 'next/head'
import BodySection from '../components/bodySection'
import React from 'react';
import { useEffect } from 'react'

import * as userInfo from './../components/userInfo'
import HomeContent from './mainPages/content/homeContent'
import AssetContent from './mainPages/content/assetContent'
import StockContent from './mainPages/content/stockContent'

// Home 페이지
export default function Home() {

  useEffect(() => {

  }, []);

  return (
    <Layout>
      <Head>
        <title>Brunner Home</title>
        <meta name="description" content="서비스플랫폼"></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
        <meta name="google-adsense-account" content="ca-pub-3879149687745447"></meta>
        <script async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3879149687745447"
          crossorigin="anonymous"></script>
        <link></link>
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
