`use strict`

import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'

import requestServer from '@/components/requestServer'
import { useRouter } from 'next/router'
import { useState } from 'react'
import BrunnerMessageBox from '@/components/BrunnerMessageBox'
import * as Constants from '@/components/constants'
import Conatiner from "@/components/DivContainer"
import DivContainer from '@/components/DivContainer'

export default function ResetPassword() {
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

  const [phoneNumber, setPhoneNumber] = useState('');
  const changePhoneNumberValue = (e) => {
    setPhoneNumber(e.target.value);
  };

  const [email, setEmail] = useState('');
  const changeEMailValue = (e) => {
    setEmail(e.target.value);
  };

  const [authCode, setAuthCode] = useState('');
  const changeAuthCode = (e) => {
    setAuthCode(e.target.value);
  };

  const [newPassword, setNewPassword] = useState('');
  const changePasswordValue = (e) => {
    setNewPassword(e.target.value);
  };

  const [confirmPassword, setConfirmPassword] = useState('');
  const changeConfirmPasswordValue = (e) => {
    setConfirmPassword(e.target.value);
  };

  // 1. 인증코드를 이메일로 발송요청 
  const sendEMailAuthCode = async () => {
    var jRequest = {};
    var jResponse = null;

    try {
      jRequest.commandName = Constants.COMMAND_SECURITY_SEND_EMAIL_AUTHCODE;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
      jRequest.userId = userId;
      jRequest.phoneNumber = phoneNumber;
      jRequest.email = email; // 추가

      setLoading(true); // 데이터 로딩 시작
      jResponse = await requestServer('POST', JSON.stringify(jRequest));
      setLoading(false); // 데이터 로딩 끝
      openModal(jResponse.error_message);
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error);
    }

  }

  const requestResetPassword = async () => {
    var jRequest = {};
    var jResponse = null;

    try {
      jRequest.commandName = Constants.COMMAND_SECURITY_RESET_PASSWORD;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
      jRequest.userId = userId;
      jRequest.phoneNumber = phoneNumber;
      jRequest.email = email; // 추가
      jRequest.authCode = authCode // 추가
      jRequest.newPassword = newPassword;
      jRequest.confirmPassword = confirmPassword;


      setLoading(true); // 데이터 로딩 시작
      jResponse = await requestServer('POST', JSON.stringify(jRequest));
      setLoading(false); // 데이터 로딩 끝
      var result = await openModal(jResponse.error_message);
      if (jResponse.error_code == 0 && result) {
        router.push('/mainPages/signin');
      }

    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error);
    }
  };

  const requestDeleteAccount = async () => {
    var jRequest = {};
    var jResponse = null;

    try {
      jRequest.commandName = Constants.COMMAND_SECURITY_DELETE_ACCOUNT;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
      jRequest.userId = userId;
      jRequest.phoneNumber = phoneNumber;
      jRequest.email = email;
      jRequest.authCode = authCode
      jRequest.newPassword = newPassword;
      jRequest.confirmPassword = confirmPassword;


      setLoading(true); // 데이터 로딩 시작
      jResponse = await requestServer('POST', JSON.stringify(jRequest));
      setLoading(false); // 데이터 로딩 끝
      var result = await openModal(jResponse.error_message);
      if (jResponse.error_code == 0 && result) {
        router.push('/mainPages/signin');
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
          <title>Stock Quotes and Investment Information - Brunner-Next</title>
          <meta name="description" content="서비스플랫폼"></meta>
          <meta rel="icon" href="/brunnerLogo.png"></meta>
          <link></link>
        </Head>
        <BodySection>
          <DivContainer>
            <div className="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
              <h1 className="title-font font-medium text-3xl text-gray-900">Protect your important information.</h1>
              <p className="mt-2">Enter information to leave or reset password.</p>
            </div>
            <div className="lg:flex-grow md:w-1/2 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center mt-5">
              <div className="relative w-1/2">
                <label htmlFor="id" className="text-gray-400">ID</label>
                <input type="text" id="id" name="Id" onChange={(e) => changeUserIdValue(e)} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                <label htmlFor="phone-number" className="text-sm text-gray-400 w-full">Phone Number</label>
                <input type="text" id="phone-number" name="Id" onChange={(e) => changePhoneNumberValue(e)} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                <label htmlFor="email" className="text-sm text-gray-400 w-full">E-Mail</label>
                <input type="email" onChange={(e) => changeEMailValue(e)} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                <div className="relative w-full">
                  <button onClick={() => sendEMailAuthCode()} className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-2">
                    Send Code
                  </button>
                </div>
              </div>
              <div className="relative mt-2 w-1/2">
                <label htmlFor="email"
                  className="text-sm text-gray-400 w-full">
                  Authorization Code
                </label>
                <input type="text"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 leading-8 transition-colors duration-200 ease-in-out"
                  onChange={(e) => changeAuthCode(e)}
                />
                <button onClick={() => requestDeleteAccount()}
                  className="text-white bg-pink-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-2">
                  Delete account
                </button>
              </div>
              <div className="relative mt-6 w-1/2">
                <label htmlFor="new-password"
                  className="text-sm text-gray-400">
                  New Password
                </label>
                <input type="password" id="new-password" name="new-password"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  onChange={(e) => changePasswordValue(e)}>
                </input>
                <label htmlFor="confirm-password"
                  className="text-sm text-gray-400">
                  Confirm Password
                </label>
                <input type="password"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  onChange={(e) => changeConfirmPasswordValue(e)}>
                </input>
              </div>
              <button onClick={() => requestResetPassword()}
                className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-2">
                Reset password
              </button>
            </div>
          </DivContainer>
        </BodySection>
      </Layout>
    </>
  )
}