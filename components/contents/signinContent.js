"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { RequestServer } from "@/components/core/client/requestServer";
import * as constants from "@/components/core/constants";
import Loading from "@/components/core/client/loading";
import { Button } from "antd";
import { loadMenu } from "@/components/core/client/frames/dropdownMenu";
import { Select } from "antd";

// 외부에서 import 가능하도록 export

export default function SigninContent() {
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();
  const router = useRouter();

  const userIdRef = useRef();

  const [userId, setUserId] = useState(constants.General.EmptyString);
  const [password, setPassword] = useState(constants.General.EmptyString);
  const [systemCode, setSystemCode] = useState(constants.SystemCode.Brunner);

  // 초기 focus
  useEffect(() => {
    if (userIdRef.current) userIdRef.current.focus();
  }, []);

  const changeUserIdValue = (e) => setUserId(e.target.value);
  const changePasswordValue = (e) => setPassword(e.target.value);
  const changeSystemCodeValue = (value) => setSystemCode(value);

  const requestSignIn = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.SECURITY_SIGNIN,
        systemCode,
        userId,
        password,
      };

      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);

      if (jResponse.error_code === 0) {
        jResponse.systemCode = jRequest.systemCode;

        // 사용자 기본정보를 먼저 저장하고 나서
        const userInfo = jResponse;
        localStorage.setItem("userInfo", JSON.stringify(userInfo));

        // 메뉴를 추가로 저장
        userInfo.menuItems = await loadMenu();
        localStorage.setItem("userInfo", JSON.stringify(userInfo));

        router.push("/");
      } else {
        openModal(jResponse.error_message);
      }
    } catch (e) {
      setLoading(false);
      openModal(e.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") requestSignIn();
  };

  return (
    <>
      <BrunnerMessageBox />
      {loading && <Loading />}

      <div className="w-full pr-16 flex flex-col items-start text-left mb-16 md:mb-0">
        <h2 className="page-title title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          Sign in
        </h2>

        <div className="flex flex-col mb-4">
          <label
            htmlFor="systemCode"
            className="leading-7 text-sm text-gray-400"
          >
            System Code
          </label>
          <Select
            id="systemCode"
            value={systemCode}
            onChange={changeSystemCodeValue}
            className="w-40 h-12 text-center rounded border focus:ring-2 text-base outline-none leading-8 duration-200 ease-in-out"
          >
            {Object.entries(constants.SystemCode).map(([key, value]) => (
              <option className="text-center" key={key} value={value}>
                {key}
              </option>
            ))}
          </Select>
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
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 px-3 py-1 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>

        <div className="relative mb-4">
          <label htmlFor="password" className="leading-7 text-sm text-gray-400">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={changePasswordValue}
            onKeyPress={handleKeyPress}
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 px-3 py-1 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>

        <Button
          className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg"
          onClick={requestSignIn}
        >
          Sign in
        </Button>

        <p className="text-xs text-gray-500 mt-10">
          Forgot your password? Reset now.
        </p>
        <Button
          className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-5"
          onClick={() => router.push("/mainPages/resetPassword")}
        >
          Reset password
        </Button>

        <p className="text-xs text-gray-500 mt-10">You can delete account.</p>
        <Button
          className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-5"
          onClick={() => router.push("/mainPages/resetPassword")}
        >
          Leave & Delete Account
        </Button>
      </div>
    </>
  );
}
