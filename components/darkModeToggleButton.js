'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export default function DarkModeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const themeRef = useRef(theme);
  const [mounted, setMounted] = useState(false);

  // 마운트 후 렌더링 허용 (SSR mismatch 방지용)
  useEffect(() => {
    setMounted(true);
    setThemeRef(themeRef.current || 'light');
  }, []);

  const setThemeRef = (newValue) => {
    themeRef.current = newValue;
    setTheme(newValue);
  };

  const isDark = resolvedTheme === 'dark';

  if (!mounted) return null; // 아직 마운트되지 않았으면 아무것도 렌더링하지 않음

  return (
    <button
      type="button"
      onClick={() => setThemeRef(isDark ? 'light' : 'dark')}
      className={`relative flex items-center w-16 h-9 px-2 rounded-full transition-colors duration-300
        ${isDark ? 'bg-slate-700' : 'bg-yellow-200'}`}
    >
      {/* ☀️ Light */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="h-5 w-5 text-yellow-500 z-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25
          m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227
          l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 
          12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
      </svg>

      {/* 🌙 Dark */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="h-5 w-5 text-white ml-auto z-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 
          0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25
          C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
        />
      </svg>

      {/* 가운데 원형 토글 */}
      <span
        className={`absolute top-1 left-1 w-7 h-7 rounded-full transition-all duration-300
          ${isDark ? 'translate-x-7 bg-white' : 'translate-x-0 bg-gray-800'}`}
      />
    </button>
  );
}