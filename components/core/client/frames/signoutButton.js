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
          type="text"
          danger
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#ef4444"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
              />
            </svg>
          }
        />
      )}
    </>
  );
}
