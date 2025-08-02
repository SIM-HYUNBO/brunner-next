'use client';

import SignoutButton from "./signoutButton";
import DarkModeToggleButton from "./darkModeToggleButton";
import { useState, useEffect } from 'react';

export default function UserInfo({ handleLogout, reloadSignal, triggerMenuReload }) {
  const [userName, setUserName] = useState('');

  // 최초 렌더링 시 userInfo 로딩
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          setUserName(userInfo?.userName || '');
        }
      } catch (e) {
        console.error("Invalid userInfo JSON:", e);
      }
    }
  }, []);

  // reloadSignal이 바뀔 때 userInfo 갱신
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          setUserName(userInfo?.userName || '');
        }
      } catch (e) {
        console.error("Invalid userInfo JSON:", e);
      }
    }
  }, [reloadSignal]);

  return (
    <div className="relative w-full flex items-center mt-3 text-gray-600 dark:text-gray-400 h-10">
      
      {/* 왼쪽: 다크모드 토글 버튼 */}
      <div className="absolute left-4">
        <DarkModeToggleButton />
      </div>

      {/* 가운데: 사용자 이름 */}
      <div className="mx-auto text-center text-base">
        {getLoginUserId() && userName}
      </div>

      {/* 오른쪽: 로그아웃 버튼 */}
      <div className="absolute right-4">
        <SignoutButton handleLogout={handleLogout} triggerMenuReload={triggerMenuReload} />
      </div>
    </div>
  );
}

// helper 함수들

export const getLoginUserId = () => {
  if (typeof window !== 'undefined') {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const userInfo = JSON.parse(userInfoStr);
      return userInfo?.userId || '';
    } catch {
      return '';
    }
  }
  return '';
};

export const getLoginName = () => {
  if (typeof window !== 'undefined') {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const userInfo = JSON.parse(userInfoStr);
      return userInfo?.userName || '';
    } catch {
      return '';
    }
  }
  return '';
};

export const isAdminUser = () => {
  if (typeof window !== 'undefined') {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const userInfo = JSON.parse(userInfoStr);
      return !!userInfo?.adminFlag;
    } catch {
      return false;
    }
  }
  return false;
};

export const isLogin = () => {
  if (typeof window !== 'undefined') {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const userInfo = JSON.parse(userInfoStr);
      return !!userInfo?.userId;
    } catch {
      return false;
    }
  }
  return false;
};