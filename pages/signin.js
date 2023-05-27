import Layout from '../components/layout'
import Head from 'next/head'
import RequestServer from '../components/requestServer'
import { useRouter } from 'next/router'

export default function Signin() {
  const router = useRouter();

  var userId='';
  const changeUserIdValue = (e) => {
    userId = e.target.value
  };
  
  var password='';
  const changePasswordValue = (e) => {
    password = e.target.value
  };
    
  var requestLoginResult=()=> {
    RequestServer("GET",
      `{"commandName": "security.login",
        "userId": "${userId}",
        "password": "${password}"}`)
      .then((result) => {
        if(result.error_code==0){
          process.env.userInfo=result.userInfo;
          // console.log(JSON.stringify(process.env.userInfo));
          router.push('/')  
        }else {
          alert(JSON.stringify(result.error_message));
        }
      });
   };

  return (
    <Layout>    
      <Head>
        <title>Brunner Home</title>
        <meta name="description" content="서비스플랫폼"></meta>
        <meta rel="icon" href="brunnerLogo.png"></meta>
        <link></link>
      </Head>   
      <section class="text-gray-600 body-font">
      <div class="container px-5 py-44 mx-auto flex flex-wrap items-center">
        <div class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          <h2 class="text-gray-900 text-lg font-medium title-font">Sign In</h2>
          <div class="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
          <p class="leading-relaxed mt-4  mb-5">Enter your ID and password.</p>
        </div>
        <div class="relative mb-4">
          <label for="id" class="leading-7 text-sm text-gray-400">ID</label>
          <input type="text" id="id" name="Id" onChange={(e) => changeUserIdValue(e)} class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
        </div>
        <div class="relative mb-4">
          <label for="password" class="leading-7 text-sm text-gray-400">Password</label>
          <input type="password" id="password" name="password" 
                 class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                 onChange={(e) => changePasswordValue(e)}></input>
        </div>
        <button onClick={()=>requestLoginResult()} class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Login</button>
          <button onClick={() => router.push('/resetPassword')} class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-5">Reset Password</button>
          <p class="text-xs text-gray-500 mt-3">Nice to meet you.</p>
        </div>
      </div>
    </section>  
    </Layout>
  )
}