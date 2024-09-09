`use strict`

import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'
import TickerInfoContent from './content/tickerInfoContent'
import { useRouter } from 'next/router';

export default function TickerInfo() {
  const router = useRouter();
  const { tickerCode } = router.query;

  return (
    <Layout>
      <Head>
        <title>Stock Quotes and Investment Information - Brunner-Next</title>
        <meta name="description" content="ContactUs"></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
        <link></link>
      </Head>
      <BodySection>
        <TickerInfoContent tickerCode={tickerCode}></TickerInfoContent>
      </BodySection>
    </Layout>
  );
}