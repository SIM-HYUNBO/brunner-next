import Layout from '../components/layout'
import Head from 'next/head'
import ContactIntro from '../components/home/contact-intro'

export default function Contact(){
  return (
    <Layout>      
      <Head>
        <title>Brunner Home</title>
        <meta name="description" content="ContactUs"></meta>
        <meta rel="icon" href="brunnerLogo.png"></meta>
        <link></link>
      </Head>         
      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <ContactIntro></ContactIntro>
        </div>
      </section>
    </Layout>
  );
}