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
    <div className="relative w-full h-12 mt-3 text-gray-600 dark:text-gray-400">
      
      {/* 왼쪽 고정: 다크모드 토글 */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <DarkModeToggleButton />
      </div>

      {/* 가운데 고정: 사용자 이름 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base text-center">
        {getLoginUserId() && userName}
      </div>

      {/* 오른쪽 고정: 로그아웃 버튼 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <SignoutButton handleLogout={handleLogout} triggerMenuReload={triggerMenuReload} />
      </div>
    </div>

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