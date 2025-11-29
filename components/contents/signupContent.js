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
import { Select } from "antd";

export default function SignupContent() {
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal, openInputModal } = useModal();
  const router = useRouter();

  const [userId, setUserId] = useState(constants.General.EmptyString);
  const [password, setPassword] = useState(constants.General.EmptyString);
  const [userName, setUserName] = useState(constants.General.EmptyString);
  const [address, setAddress] = useState(constants.General.EmptyString);
  const [phoneNumber, setPhoneNumber] = useState(constants.General.EmptyString);
  const [email, setEmail] = useState(constants.General.EmptyString);
  const [registerNo, setRegisterNo] = useState(constants.General.EmptyString);
  const [systemCode, setSystemCode] = useState(constants.SystemCode.Brunner);

  // ✅ 사용자 유형
  const [userType, setUserType] = useState(constants.UserType.Personal);

  const changeUserIdValue = (e) => setUserId(e.target.value);
  const changePasswordValue = (e) => setPassword(e.target.value);
  const changeUserNameValue = (e) => setUserName(e.target.value);
  const changeAddressValue = (e) => setAddress(e.target.value);
  const changePhoneNumberValue = (e) => setPhoneNumber(e.target.value);
  const changeEMailValue = (e) => setEmail(e.target.value);
  const changeRegisterNoValue = (e) => setRegisterNo(e.target.value);
  const changeSystemCodeValue = (value) => setSystemCode(value);

  // -------------------------------
  // 사업장 검색 상태
  // -------------------------------
  const [showBizModal, setShowBizModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(
    constants.General.EmptyString
  );
  const [searchResult, setSearchResult] = useState([]);
  const [registerName, setRegisterName] = useState(
    constants.General.EmptyString
  ); // ✅ 선택된 이름 필드

  // ✅ 검색 타입
  const [searchType, setSearchType] = useState(constants.UserType.Pharmacy); // pharmacy or supplier

  // 사업장 검색
  const searchBusiness = async () => {
    if (!searchKeyword || searchKeyword.length < 3) {
      openModal("Input keyword more than 3 charactors.");
      return;
    }
    try {
      setLoading(true);

      const inputData = {
        INDATA: [
          {
            name: `"${searchKeyword}"`,
          },
        ],
      };

      const jResponse = await RequestExecuteWorkflow(
        userInfo.getCurrentSystemCode(),
        userInfo.getLoginUserId(),
        "약국목록조회",
        constants.transactionMode.System,
        inputData
      );

      setSearchResult(jResponse.jWorkflow?.data?.run?.outputs?.OUTDATA || []);
    } catch (e) {
      openModal(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 사업장 선택 시 관리번호 + 주소 자동 입력 + userType + RegisterName 설정
  const selectBusiness = (record) => {
    if (searchType === constants.UserType.Pharmacy) {
      setRegisterNo(record.manageNo);
      setAddress(record.address || constants.General.EmptyString);
      setUserType(constants.UserType.Pharmacy);
      setRegisterName(record.bizName || constants.General.EmptyString); // ✅ RegisterName 설정
      setShowBizModal(false);
    }
  };

  // 검색타입에 따라 컬럼 다르게 구성
  const columns = [
    { title: "Pharmacy Name", dataIndex: "bizName", key: "bizName" },
    { title: "ManageNo", dataIndex: "manageNo", key: "manageNo" },
    { title: "Address", dataIndex: "address", key: "address" },
    {
      title: "Select",
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
      userType,
      registerName,
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
    } catch (e) {
      setLoading(false);
      openModal(e.message);
    }
  };

  return (
    <>
      <BrunnerMessageBox />
      {loading && <Loading />}

      <div className="w-full pr-16 flex flex-col items-start text-left mb-16">
        <h2 className="page-title title-font text-3xl mb-10 font-medium text-green-900">
          Sign Up
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
          <Select
            id="systemCode"
            value={systemCode}
            onChange={changeSystemCodeValue}
            className="w-full h-10 bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 px-3 py-1 leading-8 transition-colors duration-200 ease-in-out"
          >
            {Object.entries(constants.SystemCode).map(([key, value]) => (
              <option key={key} value={value}>
                {key}
              </option>
            ))}
          </Select>
        </div>

        {/* 사용자 유형 선택 */}
        <div className="relative mb-4 w-40">
          <label htmlFor="userType" className="leading-7 text-sm text-gray-400">
            User Type
          </label>
          <Select
            id="userType"
            value={userType}
            onChange={(value) => setUserType(value)}
            className="w-full h-10 bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 px-3 py-1 leading-8 transition-colors duration-200 ease-in-out"
          >
            <option value={constants.UserType.Personal}>
              {constants.UserType.Personal}
            </option>
            <option value={constants.UserType.Pharmacy}>
              {constants.UserType.Pharmacy}
            </option>
          </Select>
        </div>

        {/* ID / Password */}
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

        {/* Name / Phone / Email */}
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

          <div className="relative mb-4 w-40">
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

          {/* Register No + Search */}
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
                  placeholder="Auto set by selection."
                  onChange={changeRegisterNoValue}
                  value={registerNo}
                />
                <Button onClick={() => setShowBizModal(true)}>Search</Button>
              </div>
            ) : (
              <input
                type="text"
                id="registerNo"
                name="RegisterNo"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                onChange={changeRegisterNoValue}
                value={registerNo}
              />
            )}
          </div>

          {/* Register Name */}
          {registerName && (
            <div className="relative mb-4 w-96">
              <label
                htmlFor="registerName"
                className="leading-7 text-sm text-gray-400"
              >
                Register Name
              </label>
              <input
                type="text"
                id="registerName"
                name="registerName"
                className="w-full bg-gray-100 rounded border border-gray-300 text-base outline-none text-gray-700 py-1 px-3 leading-8"
                value={registerName}
                readOnly
              />
            </div>
          )}

          {/* Address */}
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
              value={address}
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
          default={{ x: 200, y: 150, width: 650, height: 420 }}
          minWidth={500}
          minHeight={300}
          bounds="window"
          dragHandleClassName="modal-header"
        >
          <div
            style={{
              position: "absolute",
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
              Find Pharmacy or Supplier
              <button
                style={{ float: "right" }}
                onClick={() => setShowBizModal(false)}
              >
                ×
              </button>
            </div>

            {/* 내용 */}
            <div style={{ padding: 16, overflow: "auto", flex: 1 }}>
              {/* 검색타입 + 검색어 입력 */}
              <div style={{ display: "flex", marginBottom: 8, gap: 8 }}>
                <Select
                  value={searchType}
                  onChange={(value) => {
                    setSearchResult([]);
                    setSearchType(value);
                  }}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  <option value={constants.UserType.Pharmacy}>
                    {constants.UserType.Pharmacy}
                  </option>
                </Select>

                <Input
                  placeholder={"Pharmacy Name"}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchBusiness();
                  }}
                />
                <Button onClick={searchBusiness}>Search</Button>
              </div>

              <Table
                dataSource={searchResult}
                columns={columns}
                rowKey={"manageNo"} // 약국 관리번호
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
