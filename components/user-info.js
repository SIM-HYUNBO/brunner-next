import SignoutButton from "./signout-button";
import DarkModeToggleButton from "./dark-mode-toggle-button";
import { useState, useEffect } from 'react';
import isJson from './../pages/util';

export default function UserInfo() {

  const [userName, setuserName] = useState([]);
  useEffect(() => {
    let prevUserInfo = localStorage.getItem('userInfo');

    if (isJson(prevUserInfo)) {
      process.env.userInfo = JSON.parse(prevUserInfo);
    }

    setuserName(process.env.userInfo?.USER_NAME === undefined ? '' : process.env.userInfo.USER_NAME + '님')
  }, [])

  return (
    <div className="flex flex-row ml-3 mr-1 text-gray-600 dark:text-gray-400 align-middle">
      <DarkModeToggleButton />
      <div className="mr-1 ml-1 align-middle">
        {userName}
      </div>
      <SignoutButton />
    </div>
  );
}