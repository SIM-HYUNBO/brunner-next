import { useState, useEffect } from 'react';
import Layout from '../components/layout';
import Head from 'next/head';
import BodySection from '@/components/body-section'
import {TalkCategoryModal} from '../components/talk-category-modal'
import RequestServer from '@/components/requestServer'
import Link from "next/link";

export default function Talk() {
 
  const [selectedCategoryName, setSelectedCategoryName] = useState([]);
  const [userCategories, setUserCategories] = useState([]);

  useEffect(()=>{
    setUserCategories([])
    getUserCategories();
  }, [])

  // 사용자가 볼 카테고리의 목록을 조회
  // 내가 생성한 카테고리 + 사용자들이 가장 최근에 생성한 카테고리 함께 조회
  const getUserCategories = () =>{
    
    RequestServer("POST",
    `{"commandName": "talk.getUserCategories",
      "systemCode": "00",
      "userId": "${typeof process.env.userInfo == "undefined" ? "": process.env.userInfo?.USER_ID}"}`).then((result) => {
      // console.log(JSON.stringify(result));

      if(result.error_code==0){
        setUserCategories(result.categories);
      }else {
        alert(JSON.stringify(result));
      }
    });
  }

  return (
    <Layout>    
      <Head>
          <title>IT 기술 연구소 - Brunner</title>
          <meta name="description" content="IT 기술 연구소"></meta>
          <meta rel="icon" href="brunnerLogo.png"></meta>
          <link></link>
      </Head>   
      <BodySection>
      <div className="container mx-auto flex flex-col px-5 md:flex-col items-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
            오픈톡
          </h1>
          <pre className="mb-8 leading-relaxed text-white-900 mb-20">
              토크에 참여하고 사람들과 친분을 쌓아보세요.
          </pre>          
          <nav className="flex flex-row w-full items-start text-base justify-start">
            {userCategories.map(
              (talk_category)=>(
                <Link legacyBehavior href="">
                  <div>
                    <a className={`mr-5 
                                   ${selectedCategoryName == talk_category.CATEGORY_NAME? 'text-yellow-600 dark:text-yellow-300': 
                                                                           'text-gray-600 dark:text-gray-100'} 
                                  'hover:text-gray-400`
                                } 
                        onDoubleClick={
                                  (e) => {
                                    setSelectedCategoryName("")
                                    setSelectedCategoryName(talk_category.CATEGORY_NAME)
                                  }
                                }
                        >
                        [{talk_category.CREATE_USER_ID}] {talk_category.CATEGORY_NAME}
                    </a>
                    { 
                      selectedCategoryName == talk_category.CATEGORY_NAME && 
                      <TalkCategoryModal 
                        systemCode={talk_category.SYSTEM_CODE} 
                        categoryId={talk_category.CATEGORY_ID} 
                        categoryName={talk_category.CATEGORY_NAME} 
                        createUserId={talk_category.CREATE_USER_ID} 
                        pageSize='100'
                        key={talk_category.CATEGORY_ID} />
                      }
                </div>
              </Link>
              ))
            }
          </nav>

        </div>
      </BodySection>
    </Layout>
  )
}