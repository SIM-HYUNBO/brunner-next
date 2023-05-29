import Layout from '../components/layout'
import Head from 'next/head'
import BodySection from '../components/body-section'

import RequestServer from '../components/requestServer'

import { useRouter } from 'next/router'

export default function OverView() {
  const router = useRouter();

  return (
    <Layout>    
      <Head>
        <title>Brunner Home</title>
        <meta name="description" content="서비스플랫폼"></meta>
        <meta rel="icon" href="brunnerLogo.png"></meta>
        <link></link>
      </Head>   
      <BodySection >
        <div className="container mx-auto flex px-5 py-40 md:flex-col flex-col items-start">
        <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-green-900">
          둘러보기
        </h1>
        <p className="leading-relaxed mb-8">
          둘러보기 전에 간단한 사용자 인증 정보 입력 후 로그인 하세요.
          아직 회원이 아니면 회원 가입을 먼저 해주세요. <br></br>
          간단한 정보를 입력한 후 회원가입을 하실 수 있습니다.
        </p>
        <div>
        <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg m-2"
                onClick={() => router.push('/signin') } >
                로그인
        </button>
        <button 
        className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                onClick={() => router.push('/signup') } >
                회원가입
        </button>
        </div>
        </div>
      </BodySection>
    </Layout>
  )
}
