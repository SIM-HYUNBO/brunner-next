import BoardContentAnimation from './board-content-animation'
import { useRouter } from 'next/router'

export default function BoardContent(){
  const router = useRouter()
  
    return (
        <>
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
            모두가 함께 합니다.
            </h1>
            <pre className="mb-8 leading-relaxed text-white-900">
              모든 구성원이 자유롭게 하나가 되어 <br/>
              함께 일하는 문화를 모두가 부러워합니다. <br/>
              서로 존중하는 관계속에서 우리 스스로의 가치를 찾아 냅니다. <br/>
            </pre>
            <div className="flex justify-center">
            <button onClick={() => router.push('/boardView')}className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
              최근 게시글 보기
            </button>
            </div>
          </div>
          <div className="lg:h-2/6 lg:w-2/6">
            <BoardContentAnimation/>
          </div>
        </>
    );
}

