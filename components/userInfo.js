import SignoutButton from "./signoutButton";
import DarkModeToggleButton from "./darkModeToggleButton";
import { useState, useEffect } from 'react';

export default function UserInfo() {
  useEffect(() => {
    getLoginName();
  }, []);

  return (
    <div className="flex flex-row ml-3 mr-1 text-gray-600 dark:text-gray-400">
      <DarkModeToggleButton />
      <div className="mr-1 ml-1 grid place-items-center">
        {getLoginName()}
      </div>
      <SignoutButton />
    </div>
  );
}

export const getLoginName = () => {
  var userInfo = null;

  if (process.env.userInfo) {
    userInfo = process.env.userInfo;

    return !userInfo?.userName ? '' : userInfo?.userName;
  }
}

export const isLogin = () => {
  return getLoginName() ? true: false;
}