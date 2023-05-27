import Layout from '../components/layout'
import Head from 'next/head'
import HomeContent from '../components/home/home-content'

export default function Home() {
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
          <HomeContent></HomeContent>
        </div>
      </section>
    </Layout>
  )
}