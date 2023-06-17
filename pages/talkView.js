import Layout from '../components/layout';
import Head from 'next/head';
import BodySection from '../components/body-section'
import Link from "next/link";
import TalkItem from "../components/talk-item";

export default function TalkView(pages) {
  console.log(pages);

  return (
    <Layout>    
      <Head>
          <title>Brunner Home</title>
          <meta name="description" content="서비스플랫폼"></meta>
          <meta rel="icon" href="brunnerLogo.png"></meta>
          <link></link>
      </Head>   
      <BodySection>
        <div className="flex 
                    flex-col 
                    items-left 
                    justify-top 
                    min-h-[calc(100vh-_15rem)] 
                    px-5 mb-10">
                <nav className="flex flex-wrap items-center text-base justify-center">
                <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">회의</Link>
                  <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">스터디</Link>
                  <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">IT</Link>
                  <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">모임</Link>
                  <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">연애</Link>
                  <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">기타</Link>
                </nav>
            <div className='grid py-1 mx-1 mt-10'>
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
            <TalkItem></TalkItem> 
              {/* {pages.results.map(aPage=>(
                <TalkItem data={aPage} key={aPage.id}></TalkItem> 
               ))} */}
            </div>
        </div>
      </BodySection>
    </Layout>
  )
}