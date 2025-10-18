"use client";

import RequestServer from "@/components/core/client/requestServer";
import { useState } from "react";
import { useRouter } from "next/router";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { Button } from "antd";

export default function SignoutButton({ handleLogout, triggermenureload }) {
  const router = useRouter();
  const { BrunnerMessageBox, openModal } = useModal();
  const [loading, setLoading] = useState(false);

  const requestSignout = async () => {
    const jRequest = {
      commandName: constants.commands.SECURITY_SIGNOUT,
      userId: userInfo?.getLoginUserId(),
    };

    setLoading(true);
    const jResponse = await RequestServer(jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      localStorage.removeItem("userInfo");
      triggermenureload?.();
      handleLogout?.();
      router.push("/");
    } else {
      openModal(jResponse.error_message || "Sign-out failed.");
    }
  };

  return (
    <>
      <BrunnerMessageBox />

      {userInfo.getLoginUserId() && (
        <Button
          type="button"
          loading={loading}
          onClick={async () => {
            const result = await openModal(constants.messages.SIGNOUT);
            if (result) requestSignout();
          }}
          className={`
            flex items-center justify-center
            w-4 h-4 rounded-full
            transition-all duration-200
            bg-green-100 text-red-600
            hover:bg-red-200 hover:text-red-700
            dark:bg-gray-700 dark:text-red-400
            dark:hover:bg-gray-600 dark:hover:text-red-300
            shadow-sm hover:shadow-md
          `}
        >
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="4"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
            />
          </svg>
        </Button>
      )}
    </>
  );
}
