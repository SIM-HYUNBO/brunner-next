"use client";

import SignoutButton from "./signoutButton";
import DarkModeToggleButton from "./darkModeToggleButton";
import { useState, useEffect } from "react";
import * as constants from "@/components/core/constants";
import Link from "next/link";

export default function UserInfo({ handleLogout }) {
  const [currentSystemCode, setCurrentSystemCode] = useState(undefined);
  const [userName, setUserName] = useState(constants.General.EmptyString);

  // 최초 렌더링 시 userInfo 로딩
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          setUserName(userInfo?.userName || constants.General.EmptyString);
        }
      } catch (e) {
        console.error("Invalid userInfo JSON:", e);
      }
    }
  }, []);

  return (
    <div className="relative w-full h-2 mt-1">
      {/* 왼쪽 고정: 다크모드 토글 */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-2">
        <DarkModeToggleButton />
      </div>

      {/* 가운데 고정: 사용자 이름 */}
      <div className="absolute inset-y-0 left-1/2 flex items-center -translate-x-1/2">
        {getLoginUserId() && (
          <Link href="/mainPages/userAccount" className="text-base text-center">
            {userName}
          </Link>
        )}
      </div>

      {/* 오른쪽 고정: 로그아웃 버튼 */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <SignoutButton handleLogout={handleLogout} />
      </div>
    </div>
  );
}

// helper 함수들

export const getLoginUserId = () => {
  if (typeof window !== "undefined") {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = JSON.parse(userInfoStr);
      return userInfo?.userId || constants.General.EmptyString;
    } catch {
      return constants.General.EmptyString;
    }
  }
  return constants.General.EmptyString;
};

export const getLoginName = () => {
  if (typeof window !== "undefined") {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = JSON.parse(userInfoStr);
      return userInfo?.userName || constants.General.EmptyString;
    } catch {
      return constants.General.EmptyString;
    }
  }
  return constants.General.EmptyString;
};

export const getLoginUserType = () => {
  if (typeof window !== "undefined") {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = JSON.parse(userInfoStr);
      return userInfo?.userType || constants.General.EmptyString;
    } catch {
      return constants.General.EmptyString;
    }
  }
  return constants.General.EmptyString;
};

export const getLoginUserRegisterNo = () => {
  if (typeof window !== "undefined") {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = JSON.parse(userInfoStr);
      return userInfo?.registerNo || constants.General.EmptyString;
    } catch {
      return constants.General.EmptyString;
    }
  }
  return constants.General.EmptyString;
};

export const getLoginUserRegisterName = () => {
  if (typeof window !== "undefined") {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = JSON.parse(userInfoStr);
      return userInfo?.registerName || constants.General.EmptyString;
    } catch {
      return constants.General.EmptyString;
    }
  }
  return constants.General.EmptyString;
};

export const isAdminUser = () => {
  if (typeof window !== "undefined") {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = JSON.parse(userInfoStr);
      return !!userInfo?.adminFlag;
    } catch {
      return false;
    }
  }
  return false;
};

export const isLogin = () => {
  if (typeof window !== "undefined") {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = JSON.parse(userInfoStr);
      return !!userInfo?.userId;
    } catch {
      return false;
    }
  }
  return false;
};

export const getCurrentSystemCode = () => {
  if (typeof window !== "undefined") {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = JSON.parse(userInfoStr);
      return userInfo?.systemCode;
    } catch {
      return constants.General.EmptyString;
    }
  }
  return constants.General.EmptyString;
};

export const getCurrentSystemName = () => {
  return getCurrentSystemCode()
    ? Object.keys(constants.SystemCode).find(
        (key) => constants.SystemCode[key] === getCurrentSystemCode()
      )
    : ``;
};

export const getMenuItems = () => {
  if (typeof window !== "undefined") {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = JSON.parse(userInfoStr);
      return userInfo?.menuItems;
    } catch {
      return undefined;
    }
  }
  return undefined;
};
