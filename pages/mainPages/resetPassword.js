`use strict`

import Layout from '../../components/layout'
import Head from 'next/head'
import BodySection from '../../components/bodySection'

import requestServer from '../../components/requestServer'
import { useRouter } from 'next/router'
import { useState } from 'react'
import BrunnerMessageBox from '@/components/BrunnerMessageBox'
import * as Constants from '@/components/constants'

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

  const [registerNo, setRegisterNo] = useState('');
  const changeRegisterNoValue = (e) => {
    setRegisterNo(e.target.value);
  };

  const [phoneNumber, setPhoneNumber] = useState('');
  const changePhoneNumberValue = (e) => {
    setPhoneNumber(e.target.value);
  };

  const [newPassword, setNewPassword] = useState('');
  const changePasswordValue = (e) => {
    setNewPassword(e.target.value);
  };

  const [confirmPassword, setConfirmPassword] = useState('');
  const changeConfirmPasswordValue = (e) => {
    setConfirmPassword(e.target.value);
  };

  const requestResetPassword = async () => {
    var jRequest = {};
    var jResponse = null;

    jRequest.commandName = Constants.COMMAND_SECURITY_RESET_PASSWORD;
    jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
    jRequest.userId = userId;
    jRequest.registerNo = registerNo;
    jRequest.phoneNumber = phoneNumber;
    jRequest.newPassword = newPassword;
    jRequest.confirmPassword = confirmPassword;

    setLoading(true); // 데이터 로딩 시작
    jResponse = await requestServer('POST', JSON.stringify(jRequest));
    setLoading(false); // 데이터 로딩 시작

    openModal(jResponse.error_message);
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
        <BodySection className="text-gray-600 body-font">
          <div className="container px-5 py-14 mx-auto flex flex-wrap items-center">
            <div className="lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0 pr-0">
              <h1 className="title-font font-medium text-3xl text-gray-900">Forgot your password? </h1>
              <p className="leading-relaxed mt-4">Enter your ID, phone number, and register number to reset password.</p>
            </div>
            <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
              <h2 className="text-gray-900 text-lg font-medium title-font mb-5">Reset password</h2>
              <div className="relative mb-4">
                <label htmlFor="id" className="text-gray-400 leading-relaxed mt-4">ID</label>
                <input type="text" id="id" name="Id" onChange={(e) => changeUserIdValue(e)} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
              </div>
              <div className="relative mb-4">
                <label htmlFor="phone-number" className="leading-7 text-sm text-gray-400">Phone Number</label>
                <input type="text" id="phone-number" name="Id" onChange={(e) => changePhoneNumberValue(e)} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
              </div>
              <div className="relative mb-4">
                <label htmlFor="register-number" className="leading-7 text-sm text-gray-400">Register Number</label>
                <input type="text" id="register-number" name="Id" onChange={(e) => changeRegisterNoValue(e)} className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
              </div>
              <div className="relative mb-4">
                <label htmlFor="new-password" className="leading-7 text-sm text-gray-400">New Password</label>
                <input type="password" id="new-password" name="new-password"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  onChange={(e) => changePasswordValue(e)}></input>
              </div>
              <div className="relative mb-4">
                <label htmlFor="confirm-password" className="leading-7 text-sm text-gray-400">Confirm Password</label>
                <input type="password" id="confirm-password" name="confirm-password"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  onChange={(e) => changeConfirmPasswordValue(e)}></input>
              </div>
              <button onClick={() => requestResetPassword()} className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg">Reset password</button>
              <p className="text-xs text-gray-500 mt-3">Protect your important information.</p>
            </div>
          </div>
        </BodySection>
      </Layout>
    </>
  )
}