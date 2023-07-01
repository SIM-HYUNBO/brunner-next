import { useState, useEffect, useRef } from 'react';

import Layout from '../../components/layout'
import Head from 'next/head'
import BodySection from '../../components/body-section'
import TalkCategoryModal from '../../components/talk-category-modal'
import RequestServer from '../../components/requestServer'

export default function Talk() {
 
  const [selectedCategoryName, setSelectedCategoryName] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [otherCategories, setOtherCategories] = useState([]);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');

  const newCategoryNameRef = useRef()

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
        setUserCategories(result.users_categories);
        setOtherCategories(result.others_categories);
      }else {
        alert(JSON.stringify(result));
      }
    });
  }

  const changeCategoryTitleValue = (e)=>{
    setNewCategoryTitle(e.target.value);
  }

  const requestCreateCategoryResult = (e)=>{
    if(typeof process.env.userInfo == "undefined" || 
       process.env.userInfo.USER_ID === "undefined" || 
       process.env.userInfo.USER_ID === ''){
        alert(`the user is not logged in. sign in first.`);
   
      return;
    }

    if(newCategoryTitle === "undefined" || 
       newCategoryTitle === ''){
        alert(`the new title of the talk is required.`);
      return;
    }

    RequestServer("POST",
    `{"commandName": "talk.createTalkCategory",
      "systemCode": "00",
      "userId": "${process.env.userInfo.USER_ID}",
      "categoryName": "${newCategoryTitle}"}`).then((result) => {
      // console.log(JSON.stringify(result));
      
      if(result.result.affectedRows==1){
        alert(`successfully created.`);
        newCategoryNameRef.current.value = "";
      }else {
        alert('failed to create a talk.');
      }
      getUserCategories();
    });
  }; 

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
          <pre className="leading-relaxed text-white-900 mb-10">
              토크에 참여하거나 새토크를 개설하고 사람들과 친해지세요.
          </pre>          
          <nav className="flex flex-row w-full items-center text-base justify-start my-10">
          <label className="leading-7 text-sm text-gray-400" 
                  htmlFor="password" 
                  >
                  글제목</label>
            <input className="w-[calc(16vw)]
                              ml-5
                            bg-white rounded 
                              border border-gray-300 
                              focus:border-indigo-500 
                              focus:ring-2 focus:ring-indigo-200 
                              text-base outline-none text-gray-700 
                              py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  type="input" 
                  onChange={(e) => changeCategoryTitleValue(e)}
                  ref={newCategoryNameRef}>
            </input>            
            <button className="text-white bg-slate-500 
                                border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg ml-5"
                    onClick={(e) => ( 
                      requestCreateCategoryResult(e)
                    )}>
              새글쓰기
            </button>
        </nav>

        </div>  
        <div className="flex flex-row w-auto justify-top px-5 mb-10 h-full items-center">
          <div className="flex flex-col w-1/2 justify-top px-5 mb-10 h-full align-top"  
               id='users-category'>
            {userCategories.map(
                (talk_category)=>(
                  <div key={talk_category.CATEGORY_ID}>
                    <button className="text-white 
                                      bg-indigo-500 
                                      border-0 py-2 
                                      px-8 
                                      focus:outline-none 
                                      hover:bg-indigo-600 
                                      rounded 
                                      text-lg 
                                      mt-5"
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
                  </div>
                ))
              }
          </div>
          <div className="flex flex-col w-1/2 justify-top px-5 mb-10 h-full align-top"  
               id='others-category'>
            {otherCategories.map(
                (talk_category)=>(
                  <div key={talk_category.CATEGORY_ID}>
                    <button className="text-white 
                                      bg-indigo-500 
                                      border-0 py-2 
                                      px-8 
                                      focus:outline-none 
                                      hover:bg-indigo-600 
                                      rounded 
                                      text-lg 
                                      mt-5"
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
                  </div>
                ))
              }
          </div>
        </div>
      </BodySection>
    </Layout>
  )
}