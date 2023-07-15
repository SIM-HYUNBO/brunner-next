import dotenv from 'dotenv'
import { useEffect } from 'react';
import Layout from '../components/layout'
import Head from 'next/head'
import BodySection from '../components/body-section'
import HomeContent from './mainPages/content/home-content'

export default function Home() {
  dotenv.config();

  let prevUserInfo = {};

  useEffect(() => {
    prevUserInfo = localStorage.getItem('userInfo');

    if (isJson(prevUserInfo)) {
      const jPrevUserInfo = JSON.parse(prevUserInfo);
      process.env.userInfo = prevUserInfo;
    }
  }, []);

  function isJson(str) {
    try {
      if (typeof str == "undefined")
        return false;

      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

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