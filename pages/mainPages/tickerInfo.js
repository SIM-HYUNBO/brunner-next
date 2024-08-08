`use strict`

import Layout from '../../components/layout'
import Head from 'next/head'
import BodySection from '../../components/bodySection'
import TickerInfoContent from './content/tickerInfoContent'
import { useRouter } from 'next/router';

export default function TickerInfo() {
  const router = useRouter();
  const { currentStockTicker } = router.query;

  return (
    <Layout>
      <Head>
        <title>Brunner Home</title>
        <meta name="description" content="ContactUs"></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
        <link></link>
      </Head>
      <BodySection>
        <div className="container mx-auto flex px-5 md:flex-row flex-col items-center">
          <TickerInfoContent currentStockTicker={currentStockTicker}></TickerInfoContent>
        </div>
      </BodySection>
    </Layout>
  );
}