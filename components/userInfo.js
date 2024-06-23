import SignoutButton from "./signoutButton";
import DarkModeToggleButton from "./darkModeToggleButton";
import { useState, useEffect } from 'react';
import isJson from '../pages/util';

export default function UserInfo() {
  useEffect(() => {

  }, []);

  const getLoginName = () => {
    var userInfo = null;

    if (typeof window !== 'undefined' && localStorage.getItem('userInfo') !== 'undefined') {
      if (JSON.parse(localStorage.getItem('userInfo')))
        userInfo = JSON.parse(localStorage.getItem('userInfo'));

      return !userInfo?.userName ? '' : userInfo?.userName;
    }
    else {
      return '';
    }
  }

  return (
    <div className="flex flex-row ml-3 mr-1 text-gray-600 dark:text-gray-400 align-middle">
      <DarkModeToggleButton />
      <div className="mr-1 ml-1 align-middle">
        {getLoginName()}
      </div>
      <SignoutButton />
    </div>
  );
}