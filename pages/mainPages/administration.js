`use strict`

import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'

import AdminContent from './content/adminContent'

export default function AdminPage() {
  return (
    <Layout>
      <Head>
        <title>Stock Quotes and Investment Information - Brunner-Next</title>
        <meta name="description" content="Breakfast, Lunch and Dinner"></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
      </Head>
      <BodySection>
        <AdminContent></AdminContent>
      </BodySection>
    </Layout>
  );
}