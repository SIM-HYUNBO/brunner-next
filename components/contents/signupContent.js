"use client";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import {
  RequestServer,
  RequestExecuteWorkflow,
} from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import * as constants from "@/components/core/constants";
import Loading from "@/components/core/client/loading";
import { Button, Input, Table } from "antd";
import { Rnd } from "react-rnd";

export default function SignupContent() {
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [registerNo, setRegisterNo] = useState("");
  const [systemCode, setSystemCode] = useState(constants.SystemCode.Brunner);

  const changeUserIdValue = (e) => setUserId(e.target.value);
  const changePasswordValue = (e) => setPassword(e.target.value);
  const changeUserNameValue = (e) => setUserName(e.target.value);
  const changeAddressValue = (e) => setAddress(e.target.value);
  const changePhoneNumberValue = (e) => setPhoneNumber(e.target.value);
  const changeEMailValue = (e) => setEmail(e.target.value);
  const changeRegisterNoValue = (e) => setRegisterNo(e.target.value);
  const changeSystemCodeValue = (e) => setSystemCode(e.target.value);

  // -------------------------------
  // 사업장 검색 상태
  // -------------------------------
  const [showBizModal, setShowBizModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  // 사업장 검색
  const searchBusiness = async () => {
    if (!searchKeyword) {
      openModal("검색어를 입력하세요.");
      return;
    }
    try {
      setLoading(true);
      const jResponse = await RequestExecuteWorkflow(
        constants.SystemCode.Brunner,
        userInfo.getLoginUserId(),
        `805a3397-c2a5-40f1-a418-a8bc94262450`,
        constants.transactionMode.System,
        JSON.parse(`{
          "INDATA" : [
            {"name" : "${searchKeyword}"}
          ]
        }`)
      );
      setSearchResult(jResponse.jWorkflow?.data?.run?.outputs?.OUTDATA || []);
    } catch (err) {
      openModal(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 사업장 선택 시 관리번호 + 주소 자동 입력
  const selectBusiness = (record) => {
    setRegisterNo(record.manageNo);
    setAddress(record.address || "");
    setShowBizModal(false);
  };

  const columns = [
    { title: "사업장명", dataIndex: "bizName", key: "bizName" },
    { title: "관리번호", dataIndex: "manageNo", key: "manageNo" },
    { title: "주소", dataIndex: "address", key: "address" },
    {
      title: "선택",
      render: (_, record) => (
        <Button type="link" onClick={() => selectBusiness(record)}>
          선택
        </Button>
      ),
    },
  ];

  // 회원가입 요청
  const requestSignup = async () => {
    const jRequest = {
      commandName: constants.commands.SECURITY_SIGNUP,
      systemCode,
      userId,
      password,
      userName,
      phoneNumber,
      email,
      registerNo,
      address,
    };
    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      if (jResponse.error_code === 0) {
        const result = await openModal(constants.messages.SUCCESS_SIGNUP);
        if (result) router.push("/mainPages/signin");
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  return (
    <>
      <BrunnerMessageBox />
      {loading && <Loading />}

      <div className="w-full pr-16 flex flex-col items-start text-left mb-16">
        <h2 className="page-title title-font text-3xl mb-10 font-medium text-green-900">
          Create account
        </h2>
        <div className="md:pr-16 lg:pr-0 pr-0">
          <p className="leading-relaxed mt-4 mb-5">Enter your Information.</p>
        </div>

        {/* 시스템코드 선택 */}
        <div className="relative mb-4 w-40">
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
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 px-3 py-1 leading-8 transition-colors duration-200 ease-in-out"
          >
            {Object.entries(constants.SystemCode).map(([key, value]) => (
              <option key={key} value={value}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap w-screen">
          <div className="relative mb-4 mr-5 w-40">
            <label htmlFor="id" className="leading-7 text-sm text-gray-400">
              ID
            </label>
            <input
              type="text"
              id="id"
              name="Id"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              onChange={changeUserIdValue}
            />
          </div>

          <div className="relative mb-4 mr-5 w-40">
            <label
              htmlFor="password"
              className="leading-7 text-sm text-gray-400"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              onChange={changePasswordValue}
            />
          </div>
        </div>

        <div className="flex flex-col w-screen">
          <div className="relative mb-4 mr-5 w-40">
            <label htmlFor="name" className="leading-7 text-sm text-gray-400">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="Name"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              onChange={changeUserNameValue}
            />
          </div>

          <div className="relative mb-4 mr-5 w-40">
            <label
              htmlFor="phoneNumber"
              className="leading-7 text-sm text-gray-400"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="PhoneNumber"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              onChange={changePhoneNumberValue}
            />
          </div>

          <div className="relative mb-4 mr-5 w-40">
            <label htmlFor="email" className="leading-7 text-sm text-gray-400">
              E-Mail
            </label>
            <input
              type="email"
              id="email"
              name="Email"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              onChange={changeEMailValue}
            />
          </div>

          <div className="relative mb-4 w-40">
            <label
              htmlFor="registerNo"
              className="leading-7 text-sm text-gray-400"
            >
              Register No
            </label>
            {systemCode === "01" ? (
              <div className="flex flex-row space-x-2">
                <Input
                  className="min-w-60"
                  value={registerNo}
                  placeholder="사업장 선택 시 자동입력"
                  readOnly
                />
                <Button onClick={() => setShowBizModal(true)}>
                  사업장 검색
                </Button>
              </div>
            ) : (
              <input
                type="text"
                id="registerNo"
                name="RegisterNo"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                onChange={changeRegisterNoValue}
              />
            )}
          </div>

          <div className="relative mb-4 w-96">
            <label
              htmlFor="address"
              className="leading-7 text-sm text-gray-400"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="Address"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              onChange={changeAddressValue}
            />
          </div>
        </div>

        <Button
          onClick={requestSignup}
          className="text-white bg-indigo-500 max-w-max border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        >
          Sign up
        </Button>

        <p className="text-xs text-gray-500 mt-3">Nice to meet you.</p>
      </div>

      {/* Rnd 기반 사업장 검색 모달 */}
      {showBizModal && (
        <Rnd
          default={{ x: 200, y: 150, width: 600, height: 400 }}
          minWidth={500}
          minHeight={300}
          bounds="window"
          dragHandleClassName="modal-header"
        >
          <div
            style={{
              position: "absolute",
              zIndex: 9999,
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* 헤더 */}
            <div
              className="modal-header"
              style={{
                padding: "8px 16px",
                cursor: "move",
                backgroundColor: "#f0f0f0",
                borderBottom: "1px solid #ccc",
              }}
            >
              사업장 검색
              <button
                style={{ float: "right" }}
                onClick={() => setShowBizModal(false)}
              >
                ×
              </button>
            </div>

            {/* 내용 */}
            <div style={{ padding: 16, overflow: "auto", flex: 1 }}>
              <div style={{ display: "flex", marginBottom: 8, gap: 8 }}>
                <Input
                  placeholder="사업장명 또는 키워드 입력"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <Button onClick={searchBusiness}>검색</Button>
              </div>
              <Table
                dataSource={searchResult}
                columns={columns}
                rowKey="manageNo"
                pagination={false}
                size="small"
              />
            </div>
          </div>
        </Rnd>
      )}
    </>
  );
}
