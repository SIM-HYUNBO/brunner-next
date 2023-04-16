import Layout from '../components/layout'
import Head from 'next/head'
import PortalIntro from '../components/home/portal-intro'

export default function Portal(){
  return (
    <Layout>      
      <Head>
        <title>Brunner 홈페이지</title>
        <meta name="description" content="서비스플랫폼"></meta>
        <meta rel="icon" href="brunnerLogo.png"></meta>
        <link></link>
      </Head>         
      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <PortalIntro></PortalIntro>
        </div>
      </section>
    </Layout>
    );
}