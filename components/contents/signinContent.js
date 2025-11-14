"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { RequestServer } from "@/components/core/client/requestServer";
import * as constants from "@/components/core/constants";
import Loading from "@/components/core/client/loading";
import { Button } from "antd";

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
  const changeSystemCodeValue = (e) => setSystemCode(e.target.value);

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
        localStorage.setItem("userInfo", JSON.stringify(jResponse));
        router.push("/");
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
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
          <select
            id="systemCode"
            value={systemCode}
            onChange={changeSystemCodeValue}
            className="bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 px-3 py-1 leading-8 transition-colors duration-200 ease-in-out"
          >
            {Object.entries(constants.SystemCode).map(([key, value]) => (
              <option key={key} value={value}>
                {key}
              </option>
            ))}
          </select>
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
