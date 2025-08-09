`use strict`

import React from 'react';
import Head from 'next/head'
import Script from 'next/script';
import {useEffect} from 'react'
import * as constants from "@/components/constants";
import Layout from '@/components/layout'
import BodySection from '@/components/bodySection'
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
        <title>Noesis Pelagos - Brunner-Next</title>
        <meta name="description" 
              content={`${constants.messages.SITE_DESCRIPTION}`}></meta>
        <meta name="keywords" 
              content="Digital document, 전자 문서"></meta>
        <link rel="icon" 
              href="/favicon.png?v=20250807" 
              type="image/png" />
        <link rel="shortcut icon" 
              href="/favicon.png?v=20250807" 
              type="image/png" />
        <meta name="google-adsense-account" 
              content="ca-pub-3879149687745447">
        </meta> 
        
        <GoogleAdScript />
      </Head>
      <BodySection>
        <HomeContent></HomeContent>
      </BodySection>
    </Layout>
  )
}
