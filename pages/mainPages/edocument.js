'use strict'

import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Layout from '@/components/layout';
import Head from 'next/head';
import BodySection from '@/components/bodySection';
import EDocContent from './content/edocContent';

export default function EDocument() {
  const { theme, setTheme } = useTheme();
  const themeRef = useRef(theme);

  const router = useRouter();
  const { documentId } = router.query;

  // 훅은 항상 컴포넌트 최상단에서 호출!
  useEffect(() => {
    setThemeRef(themeRef.current);
  }, []);

  const setThemeRef = (newValue) => {
    themeRef.current = newValue;
    setTheme(newValue);
  };

  useEffect(() => {
    if (!documentId) return;
  }, [documentId]);

  // 조건문에서는 렌더링만 분기
  if (!router.isReady || !documentId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Document View - Brunner-Next</title>
        <meta name="description" content="View your document here"></meta>
        <meta rel="icon" href="/brunnerLogo2025.png"></meta>
      </Head>
      <BodySection>
        <div className="w-full">
          <EDocContent documentId={documentId} />
        </div>
      </BodySection>
    </Layout>
  );
}