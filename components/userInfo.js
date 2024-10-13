`use strict`

import SignoutButton from "./SignoutButton";
import DarkModeToggleButton from "./DarkModeToggleButton";
import { useState, useEffect } from 'react';

export default function UserInfo() {


  useEffect(() => {
    getLoginName();
  }, []);

  return (
    <div className="flex flex-row ml-3 mr-1 text-gray-600 dark:text-gray-400">
      <DarkModeToggleButton />
      <div className="mr-1 ml-1 inline-block align-middle">
        {getLoginName()}
      </div>
      <SignoutButton />
    </div>
  );
}

export const getLoginUserId = () => {
  var userInfo = null;

  if (process.env.userInfo) {
    userInfo = process.env.userInfo;
  }
  return userInfo?.userId;
}

export const getLoginName = () => {
  var userInfo = null;

  if (process.env.userInfo) {
    userInfo = process.env.userInfo;

    return !userInfo?.userName ? '' : userInfo?.userName;
  }
}

export const isAdminUser = () => {
  var userInfo = null;

  if (process.env.userInfo) {
    userInfo = process.env.userInfo;

    return !userInfo?.adminFlag ? '' : userInfo?.adminFlag;
  }
}

export const isLogin = () => {
  return process.env.userInfo?.userId ? true : false;
}