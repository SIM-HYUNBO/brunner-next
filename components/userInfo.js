import SignoutButton from "./signoutButton";
import DarkModeToggleButton from "./darkModeToggleButton";
import { useState, useEffect } from 'react';
import isJson from '../pages/util';

export default function UserInfo() {
  useEffect(() => {

  }, []);

  return (
    <div className="flex flex-row ml-3 mr-1 text-gray-600 dark:text-gray-400 align-middle">
      <DarkModeToggleButton />
      <div className="mr-1 ml-1 align-middle">
        {(typeof window !== 'undefined' && localStorage.getItem('userInfo') !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo')) : null)?.userId ? '' : (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo')) : null)?.userId + '님'}
      </div>
      <SignoutButton />
    </div>
  );
}