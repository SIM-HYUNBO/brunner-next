`use strict`

import { useState, useRef, useEffect } from 'react';
import * as constants from '@/components/constants'
import Head from 'next/head'
import Layout from '@/components/layout'
import BodySection from '@/components/bodySection'
import AdminContent from './content/adminContent'

export default function AdminPage() {
  return (
    <Layout>
      <Head>
        <title>Noesis Pelagos - Brunner-Next</title>
        <meta 
        name="description" 
        content={`${constants.messages.SITE_DESCRIPTION}`}></meta>
        <meta rel="icon" href="/brunnerLogo2025.png"></meta>
      </Head>
      <BodySection>
        <AdminContent></AdminContent>
      </BodySection>
    </Layout>
  );
}