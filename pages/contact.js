import Layout from '../components/layout'
import Head from 'next/head'
import ContractContent from '../components/home/contact-content'

export default function Contact(){
  return (
    <Layout>      
      <Head>
        <title>Brunner Home</title>
        <meta name="description" content="ContactUs"></meta>
        <meta rel="icon" href="brunnerLogo.png"></meta>
        <link></link>
      </Head>         
      <section className="text-gray-600 body-font min-h-[calc(100vh_-_15rem)]">
        <div className="container mx-auto flex px-5 md:flex-row flex-col items-center">
          <ContractContent></ContractContent>
        </div>
      </section>
    </Layout>
  );
}