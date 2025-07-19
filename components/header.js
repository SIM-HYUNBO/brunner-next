`use strict`;

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as userInfo from "@/components/userInfo";
import DivContainer from "@/components/divContainer";
import { getLeftMenuItems } from "@/components/leftMenuItems"; 

export default function Header({ triggerLeftMenuReload }) {
  const UserInfo = userInfo.default;

  const topMenu = () => {
    return (
      <nav className={`md:ml-auto flex flex-wrap items-center text-base justify-center`}>
        <Link
          className={`mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400`}
          href="/mainPages/contact"
        >
          Contact
        </Link>
        {userInfo.isAdminUser() && (
          <Link
            className={`mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400`}
            href="/mainPages/administration"
          >
            Administration
          </Link>
        )}
        <Link href="/" className={`ml-4 flex items-center`}>
          <Image
            src="/homeIcon.png"
            height={24}
            width={24}
            alt="home icon"
          />
        </Link>

        <UserInfo handleLogout={handleLogout} />
      </nav>
    );
  };

  const handleLogout = () => {
    if (triggerLeftMenuReload) triggerLeftMenuReload();
    // 추가로 페이지 이동 등 필요시 처리
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leftMenuItems, setLeftMenuItems] = useState([]);
  
  const mobileDropdownMenu = () => (
      <div className={`md:hidden`}>
        <button
          className="p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {/* ...SVG... */}
        </button>
        {mobileMenuOpen && (
          <div className="absolute right-4 mt-2 w-64 bg-white shadow-lg rounded z-50">
            {leftMenuItems.map((item, idx) =>
              item.type === "divider" ? (
                <hr key={idx} className="my-2 border-gray-300" />
              ) : item.type === "section" ? (
                <div key={idx} className="px-4 py-2 text-gray-500">{item.label}</div>
              ) : (
                <Link
                  key={item.href + idx}
                  href={item.href}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            {/* 기존 topMenu의 Contact, Administration 등도 추가 */}
            <Link href="/mainPages/contact" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Contact</Link>
            {userInfo.isAdminUser() && (
              <Link href="/mainPages/administration" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Administration</Link>
            )}
            <UserInfo handleLogout={handleLogout} />
          </div>
        )}
      </div>
    );

    useEffect(() => {
      // 메뉴 항목 동기화
      getLeftMenuItems().then(setLeftMenuItems);
    }, []);

  return (
    <>
      <header className={`text-gray-600 body-font mb-10`}>
        <DivContainer className="flex items-center">
  <Link
    className={`flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0`}
    href="/"
  >
    <Image
      src="/brunnerLogo.png"
      height={100}
      width={100}
      alt="brunner logo"
      priority="true"
    />
  </Link>
  <Link
    className={`flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0`}
    href="/"
  >
    <h1 className={`title-font sm:text-4xl text-3xl m-5 font-medium text-orange-900`}>
      Brunner
    </h1>
  </Link>
  <div className="flex-1"></div>
  {/* 우측에 메뉴 버튼/네비게이션 */}
  <div className="flex items-center">
    <div className="md:hidden">{mobileDropdownMenu()}</div>
    <div className="hidden md:flex flex-wrap items-center justify-end">
      {topMenu()}
    </div>
  </div>
</DivContainer>
      </header>
    </>
  );
}
