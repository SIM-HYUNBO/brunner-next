"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as constants from "@/components/core/constants";
import * as commonFunctions from "@/components/core/commonFunctions";
import { useRouter } from "next/router";
import SignoutButton from "@/components/core/client/frames/signoutButton";
import DarkModeToggleButton from "@/components/core/client/frames/darkModeToggleButton";

export default function UserInfo({ handleLogout }) {
  const router = useRouter();
  const [currentSystemCode, setCurrentSystemCode] = useState(undefined);
  const [userName, setUserName] = useState(constants.General.EmptyString);
  const [profileImage, setProfileImage] = useState(undefined);

  // 최초 렌더링 시 userInfo 로딩
  useEffect(() => {
    const checkUserInfo = async () => {
      const userInfoStr = localStorage.getItem("userInfo");
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);

        // 마지막 사용시간 경과시간 체크 (1시간)
        if (
          userInfo &&
          userInfo._txnId &&
          getElapsedSeconds(userInfo._txnId) > 1 * (60 * 60)
        ) {
          localStorage.removeItem("userInfo");
          router.push("/mainPages/signin");
          await handleLogout();
          return;
        }

        // 정상 렌더링: _txnId 갱신 (사용중에 로그아웃 되지 않도록)
        const newTxnId = await commonFunctions.generateTxnId();
        userInfo._txnId = newTxnId;
        localStorage.setItem("userInfo", JSON.stringify(userInfo));

        // 상태 업데이트
        setUserName(userInfo?.userName || constants.General.EmptyString);
        setProfileImage(userInfo?.profileImageBase64);
      }
    };

    checkUserInfo();
  }, []);

  function getElapsedSeconds(txnId) {
    if (!txnId) return 0;

    // 앞 14자리만 사용: YYYYMMDDHHMMSS
    const y = parseInt(txnId.slice(0, 4), 10);
    const m = parseInt(txnId.slice(4, 6), 10) - 1; // JS 월은 0~11
    const d = parseInt(txnId.slice(6, 8), 10);
    const h = parseInt(txnId.slice(8, 10), 10);
    const min = parseInt(txnId.slice(10, 12), 10);
    const s = parseInt(txnId.slice(12, 14), 10);

    const txnDateUTC = new Date(Date.UTC(y, m, d, h, min, s));
    const nowUTC = new Date(Date.now()); // 현재 시간
    const elapsedMs = nowUTC.getTime() - txnDateUTC.getTime();

    return Math.floor(elapsedMs / 1000); // 초 단위
  }

  return (
    <div className="relative w-full h-8 mt-1">
      {/* 왼쪽 고정: 다크모드 토글 */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-2">
        <DarkModeToggleButton />
      </div>

      {/* 가운데 고정: 프로필 이미지 + 사용자 이름 */}
      <div className="absolute inset-y-0 left-1/2 flex items-center -translate-x-1/2 gap-2">
        {getLoginUserId() && (
          <Link
            href="/mainPages/userAccount"
            className="semi-text-bg-color text-center flex items-center gap-2"
          >
            {/* 프로필 이미지 */}
            {profileImage && (
              <img
                src={profileImage}
                alt="profile"
                className="w-6 h-6 rounded-full object-cover border"
              />
            )}

            {/* 사용자 이름 */}
            <span>{userName}</span>
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

export const getLoginProfileImage = () => {
  if (typeof window !== "undefined") {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = JSON.parse(userInfoStr);
      return userInfo?.profileImageBase64;
    } catch {
      return undefined;
    }
  }
  return undefined;
};
