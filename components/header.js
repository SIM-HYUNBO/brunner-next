import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as userInfo from "@/components/userInfo";
import DivContainer from "@/components/divContainer";
import { getLeftMenuItems } from "@/components/leftMenuItems";

export default function Header({ triggerLeftMenuReload }) {
  const UserInfo = userInfo.default;

  const handleLogout = () => {
    if (triggerLeftMenuReload) triggerLeftMenuReload();
    // 필요하다면 로그아웃 후 이동 처리 추가
  };

  const topMenu = () => {
    return (
      <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
        <Link
          className="mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400"
          href="/mainPages/contact"
        >
          Contact
        </Link>
        {userInfo.isAdminUser() && (
          <Link
            className="mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400"
            href="/mainPages/administration"
          >
            Administration
          </Link>
        )}
        <Link href="/" className="ml-4 flex items-center">
          <Image src="/homeIcon.png" height={24} width={24} alt="home icon" />
        </Link>
        <UserInfo handleLogout={handleLogout} />
      </nav>
    );
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leftMenuItems, setLeftMenuItems] = useState([]);

  const mobileDropdownMenu = () => (
    <>
      <button
        className="p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
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
        <div className="absolute right-4 mt-2 w-64 bg-white shadow-lg rounded z-50">
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
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}

          {/* topMenu 항목 추가 */}
          <Link
            href="/mainPages/contact"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Contact
          </Link>
          {userInfo.isAdminUser() && (
            <Link
              href="/mainPages/administration"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Administration
            </Link>
          )}
          <UserInfo handleLogout={handleLogout} />
        </div>
      )}
    </>
  );

  useEffect(() => {
    getLeftMenuItems().then(setLeftMenuItems);
  }, []);

  return (
    <header className="sticky top-0 left-0 right-0 w-full z-50 bg-white dark:bg-slate-800 text-gray-600 dark:text-white body-font mb-24">
      <DivContainer className="flex items-center w-full max-w-full relative">
        {/* 로고 */}
        <Link
          className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
          href="/"
        >
          <Image
            src="/brunnerLogo.png"
            height={100}
            width={100}
            alt="brunner logo"
            priority={true}
          />
        </Link>

        {/* 문서 제목 */}
        <Link
          className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
          href="/"
        >
          <h1 className="title-font sm:text-4xl text-3xl m-5 font-medium text-orange-900">
            Brunner
          </h1>
        </Link>

        <div className="flex-1"></div>

        {/* 모바일 햄버거 메뉴 */}
        <div className="md:hidden absolute top-4 right-4">
          {mobileDropdownMenu()}
        </div>

        {/* PC용 메뉴 */}
        <div className="hidden md:flex flex-wrap items-center justify-end">
          {topMenu()}
        </div>
      </DivContainer>
    </header>
  );
}