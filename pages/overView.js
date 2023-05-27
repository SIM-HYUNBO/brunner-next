import Layout from '../components/layout'
import Head from 'next/head'
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
      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-40 md:flex-row flex-col items-center">
        <p className="leading-relaxed mb-8 h-96">
          둘러보기 전에 간단한 사용자 인증 정보 입력 후 로그인 하세요. <br></br>
          아직 회원이 아니시면 회원 가입을 먼저 해주세요. <br></br>
          간단한 정보를 입력한 후 회원가입을 하실 수 있습니다.
        </p>
        
        <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg m-2"
                onClick={() => router.push('/signin') } >
                로그인
        </button>
        <button 
        // onClick={() => (
        //     RequestServer("POST",
        //       `{
        //         "commandName": "security.createUser",
        //         "userId": "hbsim0605",
        //         "password": "hbSim@6575"
        //       }`)
        // )} 
        className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
                회원가입
        </button>
        </div>
      </section>
    </Layout>
  )
}
