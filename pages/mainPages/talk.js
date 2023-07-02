import Layout from '../../components/layout'
import Head from 'next/head'
import BodySection from '../../components/body-section'
import TalkContent from './content/talk-content'
export default function Talk() {

  return (
    <Layout>    
      <Head>
          <title>IT 기술 연구소 - Brunner</title>
          <meta name="description" content="IT 기술 연구소"></meta>
          <meta rel="icon" href="brunnerLogo.png"></meta>
          <link></link>
      </Head>   
      <BodySection>
        <div className="container mx-auto flex flex-col px-5 md:flex-col items-start">
          <TalkContent />
       </div>  
      </BodySection>
    </Layout>
  )
}