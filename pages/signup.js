
import Layout from '../components/layout'
import Head from 'next/head'
import BodySection from '../components/body-section'
import RequestServer from '../components/requestServer'
import { useRouter } from 'next/router'

export default function Signup() {
  const router = useRouter();

  var userId='';
  const changeUserIdValue = (e) => {
    userId = e.target.value
  };
  
  var password='';
  const changePasswordValue = (e) => {
    password = e.target.value
  };

  var userName='';
  const changeUserNameValue = (e) => {
    userName = e.target.value
  };

  var address='';
  const changeAddressValue = (e) => {
    address = e.target.value
  };
  
  var phoneNumber='';
  const changePhoneNumberValue = (e) => {
    phoneNumber = e.target.value
  };
  
  var email='';
  const changeEMailValue = (e) => {
    email = e.target.value
  };
  
  var registerName='';
  const changeRegisterNameValue = (e) => {
    registerName = e.target.value
  };
  
  var registerNo='';
  const changeRegisterNoValue = (e) => {
    registerNo = e.target.value
  };
  
  var salesType='';
  const changeSalesTypeValue = (e) => {
    salesType = e.target.value
  };
  
  var salesCategory='';
  const changeSalesCategoryValue = (e) => {
    salesCategory = e.target.value
  };


  var requestSignupResult=()=> {
    RequestServer("POST",
                  `{"commandName": "security.signup",
                    "userId": "${userId}",
                    "password": "${password}",
                    "userName": "${userName}",
                    "phoneNumber": "${phoneNumber}",
                    "email": "${email}",
                    "registerNo": "${registerNo}",
                    "registerName": "${registerName}",
                    "address": "${address}",
                    "salesType": "${salesType}",
                    "salesCategory": "${salesCategory}"}`).then((result) => {
        if(result.error_code==0){
          process.env.userInfo=result.userInfo;
          alert(`successfully signed up. you will move to sign-in page.`);
          router.push('/signin')  
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
      <BodySection>
        <div className="container px-5 py-10 mx-auto flex flex-wrap">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 text-center">
            <h2 className="text-gray-900 text-lg font-medium title-font">가입하기</h2>
            <div className="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
              <p className="leading-relaxed mt-4  mb-5">Enter your Information.</p>
            </div>
            
            <div className="flex">

              <div className="relative mb-4 mr-5 w-40 ">
                <label htmlFor="id" className="leading-7 text-sm text-gray-400">ID</label>
                <input type="text" 
                      id="id" 
                      name="Id" 
                      className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                      onChange={(e) => changeUserIdValue(e)} 
                />
              </div>

              <div className="relative mb-4 mr-5 w-40">
                <label htmlFor="password" className="leading-7 text-sm text-gray-400">Password</label>
                <input type="password" 
                      id="password" 
                      name="password" 
                      className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                      onChange={(e) => changePasswordValue(e)}
                />
              </div>

              <div className="relative mb-4 mr-5 w-40">
                <label htmlFor="name" className="leading-7 text-sm text-gray-400">Name</label>
                <input type="text" 
                      id="name" 
                      name="Name" 
                      className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                      onChange={(e) => changeUserNameValue(e)} 
                />
              </div>

              <div className="relative mb-4 mr-5 w-40">
                <label htmlFor="phoneNumber" className="leading-7 text-sm text-gray-400">Phone Number</label>
                <input type="text" 
                      id="phoneNumber" 
                      name="PhoneNumber" 
                      className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                      onChange={(e) => changePhoneNumberValue(e)} 
                />
              </div>

              <div className="relative mb-4 w-40">
                <label htmlFor="email" className="leading-7 text-sm text-gray-400">E-Mail</label>
                <input type="email" 
                      id="phoneNumber" 
                      name="PhoneNumber" 
                      className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                      onChange={(e) => changeEMailValue(e)} 
                />
              </div>
            </div>

            <div className="flex">
              <div className="relative mb-4 mr-5 w-40">
                <label htmlFor="registerNo" className="leading-7 text-sm text-gray-400">Register No</label>
                <input type="text" 
                      id="registerNo" 
                      name="RegisterNo" 
                      className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                      onChange={(e) => changeRegisterNoValue(e)} 
                />
              </div>

              <div className="relative mb-4  mr-5 w-40">
                <label htmlFor="registerNo" className="leading-7 text-sm text-gray-400">Register Name</label>
                <input type="text" 
                      id="registerName" 
                      name="RegisterName" 
                      className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                      onChange={(e) => changeRegisterNameValue(e)} 
                />
              </div>

              <div className="relative mb-4 mr-5 w-96">
                <label htmlFor="id" className="leading-7 text-sm text-gray-400">Address</label>
                <input type="text" 
                      id="address" 
                      name="Address" 
                      className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                      onChange={(e) => changeAddressValue(e)} 
                />
              </div>
            </div>

              <div className="flex">

              <div className="relative mb-4 mr-5 w-40">
                <label htmlFor="salesType" className="leading-7 text-sm text-gray-400">Sales Type</label>
                <input type="text" 
                      id="salesType" 
                      name="SalesType" 
                      className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                      onChange={(e) => changeSalesTypeValue(e)} 
                />
              </div>

              <div className="relative mb-10 w-40">
                <label htmlFor="salesCategory" className="leading-7 text-sm text-gray-400">Sales Category</label>
                <input type="text" 
                      id="salesCategory" 
                      name="salesCategory" 
                      className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                      onChange={(e) => changeSalesCategoryValue(e)} 
                />
              </div>
            </div>
        
            <button onClick={()=>requestSignupResult()} 
                    className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">
              Signup
            </button>
            
            <p className="text-xs text-gray-500 mt-3">Nice to meet you.</p>
          </div>
        </div>
      </BodySection>  
    </Layout>
  )
}