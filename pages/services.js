import Layout from '../components/layout'
import Head from 'next/head'
import ServiceContent from '../components/home/service-content'

export default function Services(){
  return (
    <Layout>
      <Head>
        <title>Brunner Home</title>
        <meta name="description" content="서비스플랫폼"></meta>
        <meta rel="icon" href="brunnerLogo.png"></meta>
        <link></link>
      </Head>         
      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <ServiceContent></ServiceContent>
        </div>
      </section>
    </Layout>
  );
}