'use client';

import SignoutButton from "./signoutButton";
import DarkModeToggleButton from "./darkModeToggleButton";
import { useState, useEffect } from 'react';

export default function UserInfo({ handleLogout, reloadSignal, triggerMenuReload }) {
  const [userName, setUserName] = useState('');

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
    <div className="flex flex-row ml-3 mr-1 mt-5 text-gray-600 dark:text-gray-400">
      <DarkModeToggleButton />
      <div className="mr-1 ml-1 inline-block align-middle">
        {getLoginUserId() ? userName : ''}
      </div>
      <SignoutButton handleLogout={handleLogout} triggerMenuReload={triggerMenuReload}/>
    </div>
  );
}

// Helper 함수들
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