
import Layout from '../../../../components/layout'
import Head from 'next/head'
import BodySection from '../../../../components/body-section'
import RequestServer from '../../../../components/requestServer'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function SignupView() {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const changeUserIdValue = (e) => {
    setUserId(e.target.value);
  };

  const [password, setPassword] = useState('');
  const changePasswordValue = (e) => {
    setPassword(e.target.value);
  };

  const [userName, setUserName] = useState('');
  const changeUserNameValue = (e) => {
    setUserName(e.target.value);
  };

  const [address, setAddress] = useState('');
  const changeAddressValue = (e) => {
    setAddress(e.target.value);
  };

  const [phoneNumber, setPhoneNumber] = useState('');
  const changePhoneNumberValue = (e) => {
    setPhoneNumber(e.target.value);
  };

  const [email, setEmail] = useState('');
  const changeEMailValue = (e) => {
    setEmail(e.target.value);
  };

  const [registerNo, setRegisterNo] = useState('');
  const changeRegisterNoValue = (e) => {
    setRegisterNo(e.target.value);
  };


  var requestSignupResult = () => {
    RequestServer("POST",
      `{"commandName": "security.signup",
                    "userId": "${userId}",
                    "password": "${password}",
                    "userName": "${userName}",
                    "phoneNumber": "${phoneNumber}",
                    "email": "${email}",
                    "registerNo": "${registerNo}",
                    "address": "${address}"}`).then((result) => {
        if (result.error_code == 0) {
          process.env.userInfo = result.userInfo;
          alert(`successfully signed up. you will move to sign-in page.`);
          router.push('/signin')
        } else {
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

            <div className="flex flex-col w-screen">

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

              <div className="relative mb-4 mr-5 w-40">
                <label htmlFor="registerNo" className="leading-7 text-sm text-gray-400">Register No</label>
                <input type="text"
                  id="registerNo"
                  name="RegisterNo"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  onChange={(e) => changeRegisterNoValue(e)}
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

            <button onClick={() => requestSignupResult()}
              className="text-white bg-indigo-500 w-full border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">
              Signup
            </button>

            <p className="text-xs text-gray-500 mt-3">Nice to meet you.</p>
          </div>
        </div>
      </BodySection>
    </Layout>
  )
}