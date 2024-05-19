`use strict`

import HomeContentAnimation from './content-animation/homeContentAnimation'
import { useRouter } from 'next/router'

export default function HomeContent() {
  const router = useRouter()

  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          소통하세요.
        </h1>
        <div className="main-governing-text">
          빠르게 변하는 세상<br />
          많은 사람들과 소통으로 삶을 더 행복하게 합니다.<br />
        </div>
        <div className="flex flex-col">
          <div className="dark:text-slate-400 mb-2">
            Brunner를 더 안전하고 편리하게 이용하세요.
          </div>
          <div>
            <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg mr-2"
              onClick={() => router.push('/mainPages/signin')} >
              로그인
            </button>
            <button
              className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
              onClick={() => router.push('/mainPages/signup')} >
              회원가입
            </button>
          </div>
        </div>
      </div>
      <div className="lg:h-2/6 lg:w-2/6">
        <HomeContentAnimation />
      </div>
    </>
  );
}