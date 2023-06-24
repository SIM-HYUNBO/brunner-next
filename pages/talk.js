import Layout from '../components/layout';
import Head from 'next/head';
import BodySection from '../components/body-section'
import Link from "next/link";
import TalkItem from "../components/talk-item";
import { useState, useEffect, useRef } from 'react'
import RequestServer from '../components/requestServer'

import {TalkEditorModal} from '../components/talk-editor-modal';

export default function Talk() {

  const pageSize = 100;
  const [talkItems, setTalkItems] = useState([]);
  const [currentTalkCatetory, setCurrentTalkCatetory] = useState('회의');
  const talkEditorModal = useRef()

  useEffect(()=>{
    getTalkItems("00", '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
  }, []);

  const getTalkItems = (systemCode, talkCategory, lastTalkId) => {
    talkEditorModal.current.closeModal();
    setCurrentTalkCatetory(talkCategory);
    
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
      <div className="container mx-auto flex flex-col px-5 md:flex-col items-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
            오픈톡
          </h1>
          <pre className="mb-8 leading-relaxed text-white-900">
              모든 사람들과 친분을 쌓아보세요.
            </pre>          
          <nav className="flex flex-wrap w-full items-center text-base justify-center">
          <Link legacyBehavior href="">
              <a className={currentTalkCatetory==="자동차" ? 
                           "mr-5 text-yellow-500 dark:text-yellow-500 hover:text-gray-400" : 
                           "mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400"} 
                onClick={(e) => getTalkItems("00", '프로젝트', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>
                프로젝트
              </a>
            </Link>
            <Link legacyBehavior href="">
              <a className={currentTalkCatetory==="회의" ? 
                           "mr-5 text-yellow-500 dark:text-yellow-500 hover:text-gray-400" : 
                           "mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400"} 
                  onClick={(e) => getTalkItems("00", '회의', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>
                회의
              </a>
            </Link>
            <Link legacyBehavior href="">
              <a className={currentTalkCatetory==="스터디" ? 
                           "mr-5 text-yellow-500 dark:text-yellow-500 hover:text-gray-400" : 
                           "mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400"} 
                  onClick={(e) => getTalkItems("00", '스터디', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>
                스터디
              </a>
            </Link>
            <Link legacyBehavior href="">
              <a className={currentTalkCatetory==="연애" ? 
                           "mr-5 text-yellow-500 dark:text-yellow-500 hover:text-gray-400" : 
                           "mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400"} 
                onClick={(e) => getTalkItems("00", '코드리뷰', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>
                코드리뷰
              </a>
            </Link>
            <Link legacyBehavior href="">
              <a className={currentTalkCatetory==="IT" ? 
                           "mr-5 text-yellow-500 dark:text-yellow-500 hover:text-gray-400" : 
                           "mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400"} 
                onClick={(e) => getTalkItems("00", 'IT', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>
                IT
              </a>
            </Link>
            <Link legacyBehavior href="">
              <a className={currentTalkCatetory==="스몰톡" ? 
                           "mr-5 text-yellow-500 dark:text-yellow-500 hover:text-gray-400" : 
                           "mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400"} 
                onClick={(e) => getTalkItems("00", '스몰톡', '99991231240000_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')}>
                스몰톡
              </a>
            </Link>
          </nav>

          <div className="flex flex-col w-full
                      justify-top 
                      px-5 
                      mb-10">
              <div className='grid py-1 mx-1 mt-10'>
                <TalkEditorModal className="m-10"
                                ref={talkEditorModal} 
                                editMode='New'
                                currentTalkCatetory={currentTalkCatetory}
                                />

                {talkItems.map(aTalkItem=>(
                  
                  <TalkItem data={aTalkItem} refreshfunc={getTalkItems} key={aTalkItem.TALK_ID}></TalkItem> 
                ))}              
              </div>
          </div>
        </div>
      </BodySection>
    </Layout>
  )
}