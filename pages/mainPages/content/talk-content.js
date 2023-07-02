import { useState, useEffect, useRef } from 'react';
import RequestServer from './../../../components/requestServer'
import TalkCategoryModal from './../../../components/talk-category-modal'

export default function TalkContent(){

  const [selectedCategoryName, setSelectedCategoryName] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [otherCategories, setOtherCategories] = useState([]);

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

  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const newCategoryNameRef = useRef()

  useEffect(()=>{
    setUserCategories([])
    getUserCategories();
  }, [])

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
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          오픈톡
        </h1>
        <div className="main-governing-text">
        토크에 참여하거나 새토크를 개설하고 사람들과 친해지세요.
        </div>
      </div>
      <nav className="flex flex-row w-full items-center text-base justify-start mb-10">
          <label className="leading-7 text-sm text-gray-400 mr-2">
            글제목
          </label>
          <input className="w-[calc(16vw)]
                            mx-1
                          bg-white rounded border 
                          border-gray-300 
                          focus:border-indigo-500 
                            focus:ring-2 
                          focus:ring-indigo-200 
                            text-base 
                            outline-none 
                          text-gray-700 
                            py-1 
                            px-3 
                            leading-8 
                            transition-colors 
                            duration-200 
                            ease-in-out"
                  type="input" 
                  onChange={(e) => changeCategoryTitleValue(e)}
                  ref={newCategoryNameRef}>
          </input>            
          <button className="text-white bg-indigo-500 border-0 py-2 px-4 ml-2 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                  onClick={(e) => ( 
                      requestCreateCategoryResult(e)
                  )}>
              새글쓰기
          </button>
        </nav>           

      <div className="flex w-full">
        
        <div className="flex flex-col w-full align-top mb-10 items-start">
          <label className="leading-7 text-sm text-gray-400 mr-5">
            내 글
          </label>
          <div className="flex flex-row w-full align-top mb-10 items-start" id='users-category'>
              {userCategories.map(
                (talk_category)=>(
                    <div className="flex flex-col items-start" key={talk_category.CATEGORY_ID}>
                        <button className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg mr-2 mb-2"
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
            <label className="leading-7 text-sm text-gray-400 mr-5">
                최신 글
            </label>
            <div className="flex flex-wrap w-full align-top items-start" id='others-category'>
            { otherCategories.map(
                (talk_category)=>(
                    <div className="align-top" key={talk_category.CATEGORY_ID}>
                    <button className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg mr-2 mb-2"
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
      </div>
    </>
  )
}