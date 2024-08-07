`use strict`

import Layout from '../../components/layout'
import Head from 'next/head'
import BodySection from '../../components/bodySection'

import SupportContent from './content/supportCcntent'

export default function Support() {
  return (
    <Layout>
      <Head>
        <title>증시/자산관리 연구소 - Brunner</title>
        <meta name="description" content="IT 기술 연구소"></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
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