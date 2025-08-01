'use strict'

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes'


export function getIsDarkMode() {
    const { theme, resolvedTheme } = useTheme();

    return resolvedTheme === 'dark' ? true : false;
 }

export default function DarkModeToggleButton() {
    const { theme, setTheme } = useTheme()
    const themeRef = useRef(theme);

    const setThemeRef = (newValue) => {
        themeRef.current = newValue;
        setTheme(newValue);
    };

    useEffect(() => {
        setThemeRef(themeRef.current);
    }, []);

    return (
        <>
          <button 
             className={
             `inline-flex 
              items-center 
              boder-0 
              py-1  
              focus:outline-none 
              bg-gray-100  
              hover:bg-gray-50 
              hover:text-orange-500
              dark:bg-slate-600
              dark:text-yellow-600 
              dark:hover:text-yellow-300 
              rounded 
              text-base`}
             type="button"
             onClick={() => {
              const newTheme = theme === 'dark' ? 'light' : 'dark';
              setThemeRef(newTheme);
             }}
            >
            {/* 다크 모드 아이콘: 라이트 모드일 때 보여줌 */}
              <svg xmlns="http://www.w3.org/2000/svg" 
                   fill="none" 
                   viewBox="0 0 24 24" 
                   strokeWidth="1.5" 
                   stroke="currentColor"
                   className={`visible dark:invisible h-5 w-5`}>
                <path strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 
                         0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25
                         C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>

              {/* 라이트 모드 아이콘: 다크 모드일 때 보여줌 */}
              <svg xmlns="http://www.w3.org/2000/svg" 
                   fill="none" 
                   viewBox="0 0 24 24" 
                   strokeWidth="1.5" 
                   stroke="currentColor"
                   className={`invisible dark:visible h-5 w-5`}>
                <path strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 
                         6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 
                         1.591M5.25 12H3m4.227-4.773L5.636 5.636
                         M15.75 12a3.75 3.75 0 11-7.5 0 
                         3.75 3.75 0 017.5 0z" />
              </svg>
          </button>
        </>
    );
}