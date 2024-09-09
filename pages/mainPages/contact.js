`use strict`

import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'

import ContactContent from './content/contactContent'

export default function Contact() {
  return (
    <Layout>
      <Head>
        <title>Stock Quotes and Investment Information - Brunner-Next</title>
        <meta name="description" content="Breakfast, Lunch and Dinner"></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
        <link></link>
      </Head>
      <BodySection>
        <ContactContent></ContactContent>
      </BodySection>
    </Layout>
  );
}