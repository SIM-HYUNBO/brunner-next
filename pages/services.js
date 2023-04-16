import Layout from '../components/layout'
import Head from 'next/head'
import ServiceIntro from '../components/home/service-intro'

export default function Services(){
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
              <ServiceIntro></ServiceIntro>
            </div>
          </section>
        </Layout>
    );
}