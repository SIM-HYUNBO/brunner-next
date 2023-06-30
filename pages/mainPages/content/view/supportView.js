import Layout from '../../../../components/layout'
import Head from 'next/head'
import BodySection from '../../../../components/body-section'

export default function SupportView() {
  return (
    <Layout>    
      <Head>
        <title>Brunner Home</title>
        <meta name="description" content="서비스플랫폼"></meta>
        <meta rel="icon" href="brunnerLogo.png"></meta>
        <link></link>
      </Head>   
      <BodySection>
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <h1>Support View 입니다.</h1>
        </div>
      </BodySection>
    </Layout>
  )
}