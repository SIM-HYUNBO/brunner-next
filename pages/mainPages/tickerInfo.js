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
        <title>Brunner Home</title>
        <meta name="description" content="ContactUs"></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
        <link></link>
      </Head>
      <BodySection>
        <div className="mx-auto flex px-5 flex-col items-center">
          <TickerInfoContent tickerCode={tickerCode}></TickerInfoContent>
        </div>
      </BodySection>
    </Layout>
  );
}