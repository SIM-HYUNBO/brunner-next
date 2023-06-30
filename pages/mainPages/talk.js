import { useState, useEffect } from 'react';
import Layout from '../../components/layout';
import Head from 'next/head';
import BodySection from '../../components/body-section'
import TalkCategoryModal from '../../components/talk-category-modal'
import RequestServer from '../../components/requestServer'

export default function Talk() {
 
  const [selectedCategoryName, setSelectedCategoryName] = useState([]);
  const [userCategories, setUserCategories] = useState([]);

  useEffect(()=>{
    setUserCategories([])
    getUserCategories();
  }, [])

  // 현재 로그인 사용자가 볼 카테고리의 목록을 조회
  // 현재 로그인 사용자가 생성한 카테고리 + 다른 사용자들이 최근에 생성한 카테고리 함께 조회
  const getUserCategories = () =>{
    
    RequestServer("POST",
    `{"commandName": "talk.getUserCategories",
      "systemCode": "00",
      "userId": "${typeof process.env.userInfo == "undefined" ? "": process.env.userInfo?.USER_ID}"}`).then((result) => {
      // console.log(JSON.stringify(result));

      if(result.error_code==0){
        const categories = [
          ...result.users_categories,
          ...result.others_categories
        ]

        setUserCategories(categories);
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
          <pre className="leading-relaxed text-white-900 mb-20">
              토크에 참여하고 사람들과 친분을 쌓아보세요.
          </pre>          
          <nav className="flex flex-col w-full items-center text-base justify-start">
            <button className="text-white bg-slate-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-5 mb-10"
                    onClick={() => ( 
                      {}
                    )} 
            >
              새글쓰기
            </button>
            {userCategories.map(
              (talk_category)=>(
                <>
                  <button className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-5"
                          onClick={() => ( 
                            setSelectedCategoryName(talk_category.CATEGORY_NAME)
                          )} 
                  >
                  [{talk_category.CREATE_USER_ID}] {talk_category.CATEGORY_NAME}
                  </button>
                  <div>
                  { 
                    selectedCategoryName == talk_category.CATEGORY_NAME && 
                    <TalkCategoryModal 
                      systemCode={talk_category.SYSTEM_CODE} 
                      categoryId={talk_category.CATEGORY_ID} 
                      categoryName={talk_category.CATEGORY_NAME} 
                      createUserId={talk_category.CREATE_USER_ID} 
                      pageSize='100'
                      setSelectedCategoryName={setSelectedCategoryName}
                      key={talk_category.CATEGORY_ID} />
                    }
                  </div>
                </>
              ))
            }
          </nav>
        </div>
      </BodySection>
    </Layout>
  )
}