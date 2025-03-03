`use strict`;

import RequestServer from "./requestServer";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useModal } from "@/components/brunnerModalUtils";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
export default function SignoutButton() {
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();

  const router = useRouter();

  const requestSignout = async () => {
    var jRequest = {};
    var jResponse = null;

    jRequest.commandName = constants.commands.COMMAND_TB_COR_USER_MST_SIGNOUT;
    var userInfo = process.env.userInfo ? process.env.userInfo : null;

    jRequest.userId = userInfo?.USER_ID;

    setLoading(true); // 데이터 로딩 시작
    jResponse = await RequestServer("POST", JSON.stringify(jRequest));
    setLoading(false); // 데이터 로딩 끝

    if (jResponse.error_code == 0) {
      process.env.userInfo = null;
      router.push("/");
    } else {
      openModal(result.error_message);
    }
  };

  return (
    <>
      <BrunnerMessageBox />

      {userInfo.getLoginUserId() && (
        <button
          className="inline-flex items-center 
                                  boder-0 
                                  py-1 
                                  px-3 
                                  focus:outline-none 
                                bg-gray-100  
                                hover:bg-gray-50 
                                hover:text-orange-500
                                dark:bg-slate-600
                                dark:text-yellow-600 
                                dark:hover:text-yellow-300 
                                rounded text-base mt-4 md:mt-0"
          type="button"
          onClick={async () => {
            var result = await openModal(constants.messages.MESSAGE_SIGNOUT);
            if (result) requestSignout();
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
