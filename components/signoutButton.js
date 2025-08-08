`use strict`;

import RequestServer from "@/components/requestServer";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useModal } from "@/components/brunnerMessageBox";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";

export default function SignoutButton({ handleLogout, triggerMenuReload }) {
  const router = useRouter();
  const { BrunnerMessageBox, openModal } = useModal();
  const [loading, setLoading] = useState(false);
  
  const requestSignout = async () => {
    var jRequest = {};
    var jResponse = null;

    jRequest.commandName = constants.commands.SECURITY_SIGNOUT;

    jRequest.userId = userInfo?.getLoginUserId();

    setLoading(true); // 데이터 로딩 시작
    jResponse = await RequestServer(jRequest);
    setLoading(false); // 데이터 로딩 끝

    if (jResponse.error_code == 0) {
      localStorage.removeItem('userInfo');
      if (triggerMenuReload) triggerMenuReload();
      router.push("/");
      handleLogout();
    } else {
      openModal(result.error_message);
    }
  };

  return (
    <>
      <BrunnerMessageBox />

      {userInfo.getLoginUserId() && (
        <button
          className={`inline-flex 
                      items-center 
                      boder-0 
                      focus:outline-none 
                      bg-gray-100  
                      hover:bg-gray-50 
                      hover:text-orange-500
                      dark:bg-slate-900
                      dark:text-yellow-600 
                      dark:hover:text-yellow-300 
                      rounded 
                      text-base`}
          type="button"
          onClick={async () => {
            const result = await openModal(constants.messages.SIGNOUT);
            if (result) {
              requestSignout();
            }
          }}
        >
        <svg
          className="w-3 h-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1"
          stroke="currentColor"
        >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
        />
        </svg>
        </button>
      )}
    </>
  );
}
