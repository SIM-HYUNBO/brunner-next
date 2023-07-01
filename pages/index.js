import { useEffect } from 'react';
import Layout from '../components/layout'
import Head from 'next/head'
import BodySection from '../components/body-section'
import HomeContent from './mainPages/content/home-content'

export default function Home() {

useEffect(() => {
  window.addEventListener('beforeunload', handleUnload)
  
  return () => {
  window.removeEventListener('beforeunload', handleUnload)
};
}, []);

const handleUnload = ()=>{
  if(process.env.userInfo?.USER_ID) {
    RequestServer("POST", 
    `{"commandName": "security.signout", 
      "userId": "${process.env.userInfo?.USER_ID}"
    }`).then((result) => {

      if(result.error_code==0){
        process.env.userInfo=result.userInfo;
        localStorage.setItem('userInfo', JSON.stringify(process.env.userInfo));
      } else {
        alert(JSON.stringify(result.error_message));
      }  
    })    
  }
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