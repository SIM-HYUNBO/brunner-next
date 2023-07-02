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
          <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900 items-start">
            오픈톡
          </h1>
          <div className="main-governing-text">
              토크에 참여하거나 새토크를 개설하고 사람들과 친해지세요.
          </div>          
        </div>  
        <TalkContent />
      </BodySection>
    </Layout>
  )
}