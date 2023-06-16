import Layout from '../components/layout';
import Head from 'next/head';
import BodySection from '../components/body-section'

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
                    justify-center 
                    min-h-[calc(100vh-_15rem)] 
                    px-5 mb-10">
            <h1 className="text-white text-2xl ml-10 mb-5">
              글목록
            </h1>
            <div className='grid grid-cols-1 md:grid-cols-5 py-1 mx-1 gap-20'>
              {/* {pages.results.map(aPage=>(
                <TalkItem data={aPage} key={aPage.id}></TalkItem> 
              ))} */}
            </div>
        </div>
      </BodySection>
    </Layout>
  )
}