`use strict`

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head'
import BodySection from '@/components/bodySection'
import AdminContent from './content/adminContent'

export default function AdminPage() {
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
        <AdminContent></AdminContent>
      </BodySection>
    </>
  );
}