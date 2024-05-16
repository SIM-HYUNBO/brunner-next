`use strict`

import Layout from '../components/layout'
import Head from 'next/head'
import BodySection from '../components/body-section'
import HomeContent from './mainPages/content/home-content'
import React from 'react';
import * as serviceSQL from './api/biz/serviceSQL'

// Home 페이지
export default function Home() {

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
          <HomeContent></HomeContent>
        </div>
      </BodySection>
    </Layout>
  )
}

export async function getServerSideProps() {
  serviceSQL.loadAllSQL();
  var ret = '';

  return {
    props: {
      ret,
    },
  };
}
