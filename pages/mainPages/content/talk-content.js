import TalkCategoryModal from './../../../components/talk-category-modal'

export default function TalkContent(){

  return (
    <div className="flex flex-row w-auto align-top px-5 mb-10 items-center">
        <div className="flex flex-col w-1/2 align-top px-5 mb-10 items-end"  
            id='users-category'>
        {userCategories.map(
            (talk_category)=>(
                <div className="flex flex-col items-start" key={talk_category.CATEGORY_ID}>
                    <button className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg my-1"
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
        <div className="w-1/2"  
            id='others-category'>
        {otherCategories.map(
            (talk_category)=>(
                <div className="align-top" key={talk_category.CATEGORY_ID}>
                <button className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg my-1"
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
  )
}