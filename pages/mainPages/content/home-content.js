import HomeContentAnimation from './home-content-animation'
import { useRouter } from 'next/router'

export default function HomeContent(){
  const router = useRouter()
  
    return (
        <>
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
              항상 연구합니다.
            </h1>
            <pre className="mb-8 leading-relaxed text-white-900">
              빠르게 변하는 세상의 기술<br/>
              언제든 원하는 플랫폼을 빠르게 구축하고 사용할 수 있도록 <br/>
              최신의 기술을 연구하는 사람들이 모여 있습니다.<br/>
            </pre>
            <div className="flex justify-center">
            <div>
              <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg m-2"
                      onClick={() => router.push('/signinView') } >
                      로그인
              </button>
              <button 
              className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                      onClick={() => router.push('/signupView') } >
                      회원가입
              </button>
              </div>
            </div>
          </div>
          <div className="lg:h-2/6 lg:w-2/6">
            <HomeContentAnimation/>
          </div>
        </>
    );
}