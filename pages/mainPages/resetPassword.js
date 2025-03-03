`use strict`;

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";

import Layout from "@/components/layout";
import Head from "next/head";
import BodySection from "@/components/bodySection";

import RequestServer from "@/components/requestServer";
import { useModal } from "@/components/brunnerMessageBox";
import * as constants from "@/components/constants";
import DivContainer from "@/components/divContainer";

export default function ResetPassword() {

  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();

  useEffect(() => {
    setThemeRef(themeRef.current);
  }, []);

  const { theme, setTheme } = useTheme();
  const themeRef = useRef(theme);

  const setThemeRef = (newValue) => {
    themeRef.current = newValue;
    setTheme(newValue);
  };

  const router = useRouter();

  const [userId, setUserId] = useState("");
  const changeUserIdValue = (e) => {
    setUserId(e.target.value);
  };

  const [phoneNumber, setPhoneNumber] = useState("");
  const changePhoneNumberValue = (e) => {
    setPhoneNumber(e.target.value);
  };

  const [email, setEmail] = useState("");
  const changeEMailValue = (e) => {
    setEmail(e.target.value);
  };

  const [authCode, setAuthCode] = useState("");
  const changeAuthCode = (e) => {
    setAuthCode(e.target.value);
  };

  const [newPassword, setNewPassword] = useState("");
  const changePasswordValue = (e) => {
    setNewPassword(e.target.value);
  };

  const [confirmPassword, setConfirmPassword] = useState("");
  const changeConfirmPasswordValue = (e) => {
    setConfirmPassword(e.target.value);
  };

  // 1. 사용자 비밀번호 초기화를 위해 인증코드를 이메일로 발송요청
  const sendEMailAuthCode = async () => {
    var jRequest = {};
    var jResponse = null;

    try {
      jRequest.commandName = constants.commands.COMMAND_TB_COR_USER_MST_SEND_EMAIL_AUTHCODE;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
      jRequest.userId = userId;
      jRequest.phoneNumber = phoneNumber;
      jRequest.email = email; // 추가

      setLoading(true); // 데이터 로딩 시작
      jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false); // 데이터 로딩 끝
      openModal(jResponse.error_message);
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  const requestResetPassword = async () => {
    var jRequest = {};
    var jResponse = null;

    try {
      jRequest.commandName = constants.commands.COMMAND_TB_COR_USER_MST_RESET_PASSWORD;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
      jRequest.userId = userId;
      jRequest.phoneNumber = phoneNumber;
      jRequest.email = email; // 추가
      jRequest.authCode = authCode; // 추가
      jRequest.newPassword = newPassword;
      jRequest.confirmPassword = confirmPassword;

      setLoading(true); // 데이터 로딩 시작
      jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false); // 데이터 로딩 끝
      var result = await openModal(jResponse.error_message);
      if (jResponse.error_code == 0 && result) {
        router.push("/mainPages/signin");
      }
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  const requestDeleteAccount = async () => {
    var jRequest = {};
    var jResponse = null;

    try {
      jRequest.commandName = constants.commands.COMMAND_TB_COR_USER_MST_DELETE_ACCOUNT;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
      jRequest.userId = userId;
      jRequest.phoneNumber = phoneNumber;
      jRequest.email = email;
      jRequest.authCode = authCode;
      jRequest.newPassword = newPassword;
      jRequest.confirmPassword = confirmPassword;

      setLoading(true); // 데이터 로딩 시작
      jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false); // 데이터 로딩 끝
      var result = await openModal(jResponse.error_message);
      if (jResponse.error_code == 0 && result) {
        router.push("/mainPages/signin");
      }
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  return (
    <>
      <BrunnerMessageBox />
      <Layout>
        <Head>
          <title>Stock Quotes and Investment Information - Brunner-Next</title>
          <meta
            name="description"
            content="Brunner-Next provides real-time stock quotes. Make effective investments with real-time stock charts, investment strategies, stock news, and stock analysis tools."
          ></meta>
          <meta rel="icon" href="/brunnerLogo.png"></meta>
          <link></link>
        </Head>
        <BodySection>
          <DivContainer>
            <div className="w-3/5 pr-0">
              <h2 className="title-font font-medium text-3xl text-gray-900">
                Protect your important information.
              </h2>
              <p className="mt-2">
                Enter information to leave or reset password.
              </p>
            </div>
            <div className="w-full flex flex-col items-start text-left mb-16 mt-5">
              <div className="w-full">
                <label htmlFor="id" className="text-gray-400">
                  ID
                </label>
                <input
                  type="text"
                  id="id"
                  name="Id"
                  onChange={(e) => changeUserIdValue(e)}
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
                <label
                  htmlFor="phone-number"
                  className="text-sm text-gray-400 w-full"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone-number"
                  name="Id"
                  onChange={(e) => changePhoneNumberValue(e)}
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
                <label htmlFor="email" className="text-sm text-gray-400 w-full">
                  E-Mail
                </label>
                <input
                  type="email"
                  onChange={(e) => changeEMailValue(e)}
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
                <div className="relative w-full">
                  <button
                    onClick={() => sendEMailAuthCode()}
                    className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-2"
                  >
                    Send Code
                  </button>
                </div>
              </div>
              <div className="mt-2 w-full">
                <label htmlFor="email" className="text-sm text-gray-400 w-full">
                  Authorization Code
                </label>
                <input
                  type="text"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 leading-8 transition-colors duration-200 ease-in-out"
                  onChange={(e) => changeAuthCode(e)}
                />
                <button
                  onClick={() => requestDeleteAccount()}
                  className="text-white bg-pink-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-2"
                >
                  Delete account
                </button>
              </div>
              <div className="relative mt-6 w-full">
                <label htmlFor="new-password" className="text-sm text-gray-400">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  name="new-password"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  onChange={(e) => changePasswordValue(e)}
                ></input>
                <label
                  htmlFor="confirm-password"
                  className="text-sm text-gray-400"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  onChange={(e) => changeConfirmPasswordValue(e)}
                ></input>
              </div>
              <button
                onClick={() => requestResetPassword()}
                className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-2"
              >
                Reset password
              </button>
            </div>
          </DivContainer>
        </BodySection>
      </Layout>
    </>
  );
}
