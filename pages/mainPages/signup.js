`use strict`

import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'
import requestServer from '@/components/requestServer'
import { useRouter } from 'next/router'
import { useState } from 'react'
import BrunnerMessageBox from '@/components/BrunnerMessageBox'
import * as Constants from '@/components/constants'
import Container from "@/components/container"

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  const [modalContent, setModalContent] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => { },
    onClose: () => { }
  });

  // 모달 열기 함수
  const openModal = (message) => {
    return new Promise((resolve, reject) => {
      setModalContent({
        isOpen: true,
        message: message,
        onConfirm: (result) => { resolve(result); closeModal(); },
        onClose: () => { reject(false); closeModal(); }
      });
    });
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalContent({
      isOpen: false,
      message: '',
      onConfirm: () => { },
      onClose: () => { }
    });
  };

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


  const requestSignup = async () => {
    var jRequest = {};
    var jResponse = null;

    try {
      jRequest.commandName = Constants.COMMAND_SECURITY_SIGNUP;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
      jRequest.userId = userId;
      jRequest.password = password;
      jRequest.userName = userName;
      jRequest.phoneNumber = phoneNumber;
      jRequest.email = email;
      jRequest.registerNo = registerNo;
      jRequest.address = address;

      setLoading(true); // 데이터 로딩 시작
      jResponse = await requestServer('POST', JSON.stringify(jRequest));
      setLoading(false); // 데이터 로딩 끝

      if (jResponse.error_code == 0) {
        var result = await openModal(Constants.MESSAGE_SUCCESS_SIGNUP);
        if (result) {
          router.push('/mainPages/signin');
        }
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error);
    }
  };

  return (
    <>
      <BrunnerMessageBox
        isOpen={modalContent.isOpen}
        message={modalContent.message}
        onConfirm={modalContent.onConfirm}
        onClose={modalContent.onClose}
      />
      <Layout>
        <Head>
          <title>Brunner Home</title>
          <meta name="description" content="서비스플랫폼"></meta>
          <meta rel="icon" href="/brunnerLogo.png"></meta>
          <link></link>
        </Head>
        <BodySection>
          <Container>
            <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 text-center">
              <h2 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
                Create account
              </h2>
              <div className="md:pr-16 lg:pr-0 pr-0">
                <p className="leading-relaxed mt-4  mb-5">Enter your Information.</p>
              </div>

              <div className="flex flex-wrap w-screen">
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
              </div>
              <div className="flex flex-wrap w-screen">

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

                <div className="relative mb-4 mr-5 w-40">
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

              <button onClick={() => requestSignup()}
                className="text-white bg-indigo-500 max-w-max border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg">
                Signup
              </button>

              <p className="text-xs text-gray-500 mt-3">Nice to meet you.</p>
            </div>
          </Container>
        </BodySection>
      </Layout>
    </>
  )
}