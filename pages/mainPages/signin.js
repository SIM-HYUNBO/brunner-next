`use strict`;

import Layout from "@/components/layout";
import Head from "next/head";
import BodySection from "@/components/bodySection";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import RequestServer from "@/components/requestServer";
import { useModal } from "@/components/brunnerMessageBox";
import * as constants from "@/components/constants";
import DivContainer from "@/components/divContainer";
import { useTheme } from "next-themes";

export default function Signin() {

  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();

  useEffect(() => {
    setThemeRef(themeRef.current);
    userIdRef.current.focus();
  }, []);

  const { theme, setTheme } = useTheme();
  const themeRef = useRef(theme);

  const setThemeRef = (newValue) => {
    themeRef.current = newValue;
    setTheme(newValue);
  };

  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const userIdRef = useRef();

  const changeUserIdValue = (e) => {
    setUserId(e.target.value);
  };

  const changePasswordValue = (e) => {
    setPassword(e.target.value);
  };

  const requestSignIn = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.COMMAND_TB_COR_USER_MST_SIGNIN,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
        password: password,
      };

      setLoading(true); // 데이터 로딩 시작
      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false); // 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        process.env.userInfo = jResponse;
        router.push("/");
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      requestSignIn();
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
          />
          <link rel="icon" href="/brunnerLogo.png" />
        </Head>
        <BodySection>
          <DivContainer>
            <div className="w-full pr-16 flex flex-col items-start text-left mb-16 md:mb-0">
              <h2 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
                Sign in
              </h2>
              <div className="w-full">
                <p className="leading-relaxed mt-4 mb-5">
                  Inut ID and Password.
                </p>
              </div>
              <div className="relative mb-4">
                <label htmlFor="id" className="leading-7 text-sm text-gray-400">
                  ID
                </label>
                <input
                  type="text"
                  ref={userIdRef}
                  id="id"
                  name="Id"
                  onChange={changeUserIdValue}
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className="relative mb-4">
                <label
                  className="leading-7 text-sm text-gray-400"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  type="password"
                  id="password"
                  name="password"
                  onChange={changePasswordValue}
                  onKeyPress={handleKeyPress} // Enter 키 눌림 처리
                />
              </div>
              <button
                className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                onClick={requestSignIn}
              >
                Sign in
              </button>
              <p className="text-xs text-gray-500 mt-10">
                Forgot your password? Reset now.
              </p>
              <button
                className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-5"
                onClick={() => router.push("/mainPages/resetPassword")}
              >
                Reset password
              </button>
              <p className="text-xs text-gray-500 mt-10">
                You can delete account.
              </p>
              <button
                className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-5"
                onClick={() => router.push("/mainPages/resetPassword")}
              >
                Leave & Delete Account
              </button>
            </div>
          </DivContainer>
        </BodySection>
      </Layout>
    </>
  );
}
