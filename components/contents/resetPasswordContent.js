import { useState } from "react";
import { RequestServer } from "@/components/core/client/requestServer";
import { useRouter } from "next/router";
import * as constants from "@/components/core/constants";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import Loading from "@/components/core/client/loading";
import { Button } from "antd";

export default function ResetPasswordContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();

  const [systemCode, setSystemCode] = useState(constants.SystemCode.Brunner);
  const [userId, setUserId] = useState(constants.General.EmptyString);
  const [phoneNumber, setPhoneNumber] = useState(constants.General.EmptyString);
  const [email, setEmail] = useState(constants.General.EmptyString);
  const [authCode, setAuthCode] = useState(constants.General.EmptyString);
  const [newPassword, setNewPassword] = useState(constants.General.EmptyString);
  const [confirmPassword, setConfirmPassword] = useState(
    constants.General.EmptyString
  );

  const changeSystemCodeValue = (e) => setSystemCode(e.target.value);
  const changeUserIdValue = (e) => setUserId(e.target.value);
  const changePhoneNumberValue = (e) => setPhoneNumber(e.target.value);
  const changeEMailValue = (e) => setEmail(e.target.value);
  const changeAuthCode = (e) => setAuthCode(e.target.value);
  const changePasswordValue = (e) => setNewPassword(e.target.value);
  const changeConfirmPasswordValue = (e) => setConfirmPassword(e.target.value);

  const sendEMailAuthCode = async () => {
    const jRequest = {
      commandName: constants.commands.SECURITY_SEND_EMAIL_AUTHCODE,
      systemCode,
      userId,
      phoneNumber,
      email,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      openModal(jResponse.error_message);
    } catch (e) {
      setLoading(false);
      openModal(e.message);
    }
  };

  const requestResetPassword = async () => {
    const jRequest = {
      commandName: constants.commands.SECURITY_RESET_PASSWORD,
      systemCode,
      userId,
      phoneNumber,
      email,
      authCode,
      newPassword,
      confirmPassword,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      const result = await openModal(jResponse.error_message);
      if (jResponse.error_code === 0 && result) {
        router.push("/mainPages/signin");
      }
    } catch (e) {
      setLoading(false);
      openModal(e.message);
    }
  };

  const requestDeleteAccount = async () => {
    const jRequest = {
      commandName: constants.commands.SECURITY_DELETE_ACCOUNT,
      systemCode,
      userId,
      phoneNumber,
      email,
      authCode,
      newPassword,
      confirmPassword,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      const result = await openModal(jResponse.error_message);
      if (jResponse.error_code === 0 && result) {
        router.push("/mainPages/signin");
      }
    } catch (e) {
      setLoading(false);
      openModal(e.message);
    }
  };

  return (
    <>
      {loading && <Loading />}
      <BrunnerMessageBox />

      <div className="w-3/5 pr-0">
        <h2 className="title-font font-medium text-3xl text-gray-900">
          Protect your important information.
        </h2>
        <p className="mt-2">Enter information to leave or reset password.</p>
      </div>

      <div className="w-full flex flex-col items-start text-left mb-16 mt-5">
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

        <div className="w-full">
          <label htmlFor="id" className="text-gray-400">
            ID
          </label>
          <input
            type="text"
            id="id"
            name="Id"
            onChange={changeUserIdValue}
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
            onChange={changePhoneNumberValue}
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 px-3 py-1 leading-8 transition-colors duration-200 ease-in-out"
          />

          <label htmlFor="email" className="text-sm text-gray-400 w-full">
            E-Mail
          </label>
          <input
            type="email"
            onChange={changeEMailValue}
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 px-3 py-1 leading-8 transition-colors duration-200 ease-in-out"
          />

          <Button
            onClick={sendEMailAuthCode}
            className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-2"
          >
            Send Code
          </Button>
        </div>

        <div className="mt-2 w-full">
          <label htmlFor="auth-code" className="text-sm text-gray-400 w-full">
            Authorization Code
          </label>
          <input
            type="text"
            onChange={changeAuthCode}
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 leading-8 transition-colors duration-200 ease-in-out"
          />

          <Button
            onClick={requestDeleteAccount}
            className="text-white bg-pink-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-2"
          >
            Delete account
          </Button>
        </div>

        <div className="relative mt-6 w-full">
          <label htmlFor="new-password" className="text-sm text-gray-400">
            New Password
          </label>
          <input
            type="password"
            id="new-password"
            onChange={changePasswordValue}
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 px-3 py-1 leading-8 transition-colors duration-200 ease-in-out"
          />

          <label htmlFor="confirm-password" className="text-sm text-gray-400">
            Confirm Password
          </label>
          <input
            type="password"
            onChange={changeConfirmPasswordValue}
            className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 px-3 py-1 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>

        <Button
          onClick={requestResetPassword}
          className="text-white bg-indigo-500 border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-2"
        >
          Reset password
        </Button>
      </div>
    </>
  );
}
