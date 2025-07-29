import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as userInfo from "@/components/userInfo";
import DivContainer from "@/components/divContainer";
import { getLeftMenuItems } from "@/components/leftMenuItems";

export default function Header({ triggerLeftMenuReload, reloadSignal }) {
  const UserInfo = userInfo.default;

  const handleLogout = () => {
    if (triggerLeftMenuReload) triggerLeftMenuReload();
    
    // 필요하다면 로그아웃 후 이동 처리 추가
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leftMenuItems, setLeftMenuItems] = useState([]);

  const mobileDropdownMenu = () => (
    <>
      <button
        className="p-2 dark:bg-slate-800 dark:text-gray-100"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="메뉴 열기"
        aria-expanded={mobileMenuOpen}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-700 dark:text-gray-100"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {mobileMenuOpen && (
        <div className="absolute right-4 mt-2 w-64 bg-white shadow-lg rounded z-50 dark:bg-slate-800 dark:text-gray-100">
          {leftMenuItems.map((item, idx) =>
            item.type === "divider" ? (
              <hr key={idx} className="my-2 border-gray-300" />
            ) : item.type === "section" ? (
              <div key={idx} className="px-4 py-2 text-gray-500">
                {item.label}
              </div>
            ) : (
              <Link
                key={item.href + idx}
                href={item.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 dark:bg-slate-800 dark:text-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
          <hr />
          <UserInfo handleLogout={handleLogout} />
        </div>
      )}
    </>
  );

  useEffect(() => {
    getLeftMenuItems().then(setLeftMenuItems);
  }, [reloadSignal]);

  return (
    <header className="sticky top-0 left-0 right-0 w-full z-50 bg-white dark:bg-slate-800 text-gray-600 dark:text-white body-font md:w-2/3">
      <DivContainer className="relative flex items-center w-full max-w-full">
        {/* 로고 */}
        <Link href="/" className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
          <Image
            src="/brunnerLogo202507.png"
              alt="brunner logo"
              priority
              width={0}
              height={0}
              sizes="(max-width: 768px) 150px, 240px"
              className="w-[150px] sm:w-[240px] h-auto"
          />
        </Link>

        {/* 문서 제목 */}
        {/* <Link href="/" className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
          <h1 className="title-font sm:text-4xl text-3xl m-5 font-medium text-orange-900">Brunner</h1>
        </Link> */}

        <div className="flex-1" />

        {/* 모바일 햄버거 메뉴 */}
        <div className="absolute top-4 right-4 z-50">
          {mobileDropdownMenu()}
        </div>

        {/* PC 메뉴 */}
        {/* <div className="md:hidden lg:block w-64 bg-gray-100">
          {topMenu()}
        </div> */}
      </DivContainer>
    </header>
  );
}