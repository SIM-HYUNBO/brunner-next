import Layout from '../components/layout'
import Head from 'next/head'
import RequestServer from '../components/requestServer'
import { useRouter } from 'next/router'

export default function ResetPassword() {
  const router = useRouter();

  var userId='';
  const changeUserIdValue = (e) => {
    userId = e.target.value
  };

  var registerNo='';
  const changeRegisterNoValue = (e) => {
    registerNo = e.target.value
  };  

  var phoneNumber='';
  const changePhoneNumberValue = (e) => {
    phoneNumber = e.target.value
  };  

  var newPassword='';
  const changePasswordValue = (e) => {
    newPassword = e.target.value
  };

  var confirmPassword='';
  const changeConfirmPasswordValue = (e) => {
    confirmPassword = e.target.value
  };  

  var requestResetPasswordResult=()=> {
    RequestServer("GET",
      `{"commandName": "security.resetPassword",
        "userId": "${userId}",
        "registerNo": "${registerNo}",
        "phoneNumber": "${phoneNumber}",
        "newPassword": "${newPassword}",
        "confirmPassword": "${confirmPassword}"}`
        )
      .then((result) => {
        console.log(JSON.stringify(result));
        if(result.affectedRows==1){
          alert(`the password reset.`);
          router.push('/signin')  
        }else {
          alert('failed to reset password. please check your information again.');
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
      <div class="container px-5 py-24 mx-auto flex flex-wrap items-center">
        <div class="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
          <h1 class="title-font font-medium text-3xl text-gray-900">Did you forget your password? </h1>
          <p class="leading-relaxed mt-4">Enter your ID, phone number, and register number to reset password.</p>
        </div>
        <div class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          <h2 class="text-gray-900 text-lg font-medium title-font mb-5">Reset password</h2>
          <div class="relative mb-4">
            <label for="id" class="text-gray-400 leading-relaxed mt-4">ID</label>
            <input type="text" id="id" name="Id" onChange={(e) => changeUserIdValue(e)} class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
          </div>
          <div class="relative mb-4">
            <label for="phone-number" class="leading-7 text-sm text-gray-400">Phone Number</label>
            <input type="text" id="phone-number" name="Id" onChange={(e) => changePhoneNumberValue(e)} class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
          </div>
          <div class="relative mb-4">
            <label for="register-number" class="leading-7 text-sm text-gray-400">Register Number</label>
            <input type="text" id="register-number" name="Id" onChange={(e) => changeRegisterNoValue(e)} class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
          </div>
          <div class="relative mb-4">
            <label for="new-password" class="leading-7 text-sm text-gray-400">New Password</label>
            <input type="password" id="new-password" name="new-password" 
                   class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                   onChange={(e) => changePasswordValue(e)}></input>
          </div>
          <div class="relative mb-4">
            <label for="confirm-password" class="leading-7 text-sm text-gray-400">Confirm Password</label>
            <input type="password" id="confirm-password" name="confirm-password" 
                   class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                   onChange={(e) => changeConfirmPasswordValue(e)}></input>
          </div>
          <button onClick={()=>requestResetPasswordResult()} class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Reset password</button>
          <p class="text-xs text-gray-500 mt-3">Protect your important information.</p>
        </div>
      </div>
    </section>  
    </Layout>
  )
}