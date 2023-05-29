import Layout from '../components/layout'
import Head from 'next/head'
import BodySection from '../components/body-section'

import SupportContent from '../components/home/support-content'

export default function Support(){
  return (
    <Layout>      
      <Head>
        <title>Brunner Home</title>
        <meta name="description" content="서비스플랫폼"></meta>
        <meta rel="icon" href="brunnerLogo.png"></meta>
        <link></link>
      </Head>
      <BodySection>
        <div className="container mx-auto flex px-5 md:flex-row flex-col items-center">
          <SupportContent></SupportContent>
        </div>
      </BodySection>
  </Layout>
  );
}