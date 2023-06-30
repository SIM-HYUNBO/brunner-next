import Layout from '../components/layout'
import Head from 'next/head'
import BodySection from '../components/body-section'

import RequestServer from '../components/requestServer'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'

export default function Signin() {
  const router = useRouter();

  const [userId, setUserId]=useState('');
  const changeUserIdValue = (e) => {
    setUserId(e.target.value);
  };
  
  const [password, setPassword]=useState('');
  const changePasswordValue = (e) => {
    setPassword(e.target.value);
  };

  const userIdRef = useRef();
    
  var requestSigninResult=()=> {
    RequestServer("POST",
                  `{"commandName": "security.signin",
                    "userId": "${userId}",
                    "password": "${password}"}`).then((result) => {
        if(result.error_code==0){
          process.env.userInfo=result.userInfo;
          localStorage.setItem('userInfo', JSON.stringify(process.env.userInfo));
          console.log(`saved ${JSON.stringify(process.env.userInfo)}`);
          router.push('/')  
        }else {
          alert(JSON.stringify(result.error_message));
        }
      });
   };

   useEffect(()=>{
      userIdRef.current.focus();
   }, []);

  return (
    <Layout>    
      <Head>
        <title>IT 기술 연구소 - Brunner</title>
        <meta name="description" content="IT 기술 연구소"></meta>
        <meta rel="icon" href="brunnerLogo.png"></meta>
        <link></link>
      </Head>   
      <BodySection className="text-gray-600 body-font">
        <div className="container px-5 py-44 mx-auto flex flex-wrap items-center">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h2 className="text-gray-900 text-lg font-medium title-font">로그인</h2>
            <div className="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
            <p className="leading-relaxed mt-4  mb-5">Enter your ID and password.</p>
          </div>
          <div className="relative mb-4">
            <label htmlFor="id" className="leading-7 text-sm text-gray-400">ID</label>
            <input type="text" ref={userIdRef}  id="id" name="Id" onChange={(e) => changeUserIdValue(e)} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
          </div>
          <div className="relative mb-4">
            <label htmlFor="password" className="leading-7 text-sm text-gray-400">Password</label>
            <input type="password" id="password" name="password" 
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  onChange={(e) => changePasswordValue(e)}
                  okKeyPress={(e) => {if(e.key == 'Enter') requestSigninResult()}}
                  ></input>
          </div>
          <button onClick={()=>requestSigninResult()} className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Signin</button>
            <p className="text-xs text-gray-500 mt-10">Did you forget password? Reset now.</p>
            <button onClick={() => router.push('/resetPassword')} className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-5">Reset Password</button>
          </div>
        </div>
    </BodySection>  
    </Layout>
  )
}