`use strict`

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes'
import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'

import EDocDesignerContainer from '@/components/eDoc/eDocDesignerContainer';

export default function EDocDesigner() {
  useEffect(() => {
    setThemeRef(themeRef.current);
  }, []);

  const { theme, setTheme } = useTheme()
  const themeRef = useRef(theme);

  const setThemeRef = (newValue) => {
    themeRef.current = newValue;
    setTheme(newValue);
  };
  const documentId = null; // 또는 URL 파라미터에서 추출

  return (
    <Layout>
      <Head>
        <title>Stock Quotes and Investment Information - Brunner-Next</title>
        <meta name="description" content="Brunner-Next provides real-time stock quotes. Make effective investments with real-time stock charts, investment strategies, stock news, and stock analysis tools."></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
        <link></link>
      </Head>
      <BodySection>
          <EDocDesignerContainer documentId={documentId} />
      </BodySection>
    </Layout>
  );
}