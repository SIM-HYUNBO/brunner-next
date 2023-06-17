import Layout from '../components/layout';
import Head from 'next/head';
import BodySection from '../components/body-section'
import Link from "next/link";
import TalkItem from "../components/talk-item";
import { useState, useEffect } from 'react'
import RequestServer from '../components/requestServer'

export default function TalkView() {

  const pageSize = 100;
  const [talkItems, setTalkItems] = useState([]);
  useEffect(()=>{
    getTalkItems("00", '회의', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
  }, []);

  const getTalkItems = (systemCode, talkCategory, lastTalkId) => {
    // 해당 category에서 lastTalkId 이전에 작섣된 talkItem을 pageSize 갯수만클 조회함
    RequestServer("POST",
    `{"commandName": "talk.getTalkItems",
      "systemCode": "${systemCode}",
      "talkCategory": "${talkCategory}",
      "lastTalkId": "${lastTalkId}",
      "pageSize": ${pageSize}}`).then((result) => {
      // console.log(JSON.stringify(result));

      if(result.error_code==0){
        setTalkItems(result.talkItems);
      }else {
        alert(JSON.stringify(result));
      }
    });
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
        <div className="flex 
                    flex-col 
                    items-left 
                    justify-top 
                    min-h-[calc(100vh-_15rem)] 
                    px-5 mb-10">
                <nav className="flex flex-wrap items-center text-base justify-center">
                  <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">
                    <a onClick={(e) => getTalkItems("00", '회의', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>회의</a>
                  </Link>
                  <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">
                    <a onClick={(e) => getTalkItems("00", '스터디', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>스터디</a>
                  </Link>
                  <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">
                    <a onClick={(e) => getTalkItems("00", 'IT', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>IT</a>
                  </Link>
                  <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">
                    <a onClick={(e) => getTalkItems("00", '모임', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>모임</a>
                  </Link>
                  <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">
                    <a onClick={(e) => getTalkItems("00", '연애', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>연애</a>
                  </Link>
                  <Link className="mr-5 text-gray-600 dark:text-yellow-100 hover:text-gray-400" href="">
                    <a onClick={(e) => getTalkItems("00", '잡담', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>잡담</a>
                  </Link>

                </nav>
            <div className='grid py-1 mx-1 mt-10'>
            {talkItems.map(aTalkItem=>(
                <TalkItem data={aTalkItem} key={aTalkItem.TALK_ID}></TalkItem> 
              ))}              
            </div>
        </div>
      </BodySection>
    </Layout>
  )
}