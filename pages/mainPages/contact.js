`use strict`

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes'

import Head from 'next/head'
import BodySection from '@/components/bodySection'
import ContactContent from './content/contactContent'

export default function Contact() {
  useEffect(() => {
    setThemeRef(themeRef.current);
  }, []);

  const { theme, setTheme } = useTheme()
  const themeRef = useRef(theme);

  const setThemeRef = (newValue) => {
    themeRef.current = newValue;
    setTheme(newValue);
  };


  return (
    <>
      <Head>
        <title>Stock Quotes and Investment Information - Brunner-Next</title>
        <meta 
        name="description" 
        content="Brunner-Next provides real-time stock quotes. Make effective investments with real-time stock charts, investment strategies, stock news, and stock analysis tools."></meta>
        <meta rel="icon" href="/brunnerLogo2025.png"></meta>
      </Head>
      <BodySection>
        <ContactContent></ContactContent>
      </BodySection>
    </>
  );
}