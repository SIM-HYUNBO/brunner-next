`use strict`

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes'

import * as constants from "@/components/constants";
import Head from 'next/head'
import Layout from '@/components/layout'
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
    <Layout>
      <Head>
        <title>Noesis Pelagos - Brunner-Next</title>
        <meta name="description" 
              content=`${constants.messages.SITE_DESCRIPTION}`></meta>
        <meta rel="icon" href="/brunnerLogo2025.png"></meta>
      </Head>
      <BodySection>
        <ContactContent></ContactContent>
      </BodySection>
    </Layout>
  );
}