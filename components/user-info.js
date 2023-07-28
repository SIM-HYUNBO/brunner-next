import SignoutButton from "./signout-button";
import DarkModeToggleButton from "./dark-mode-toggle-button";
import { useState, useEffect } from 'react';
import isJson from './../pages/util';

export default function UserInfo() {
  return (
    <div className="flex flex-row ml-3 mr-1 text-gray-600 dark:text-gray-400 align-middle">
      <DarkModeToggleButton />
      <div className="mr-1 ml-1 align-middle">
        {!process.env.userInfo?.USER_NAME ? '' : process.env.userInfo?.USER_NAME + '님'}
      </div>
      <SignoutButton />
    </div>
  );
}