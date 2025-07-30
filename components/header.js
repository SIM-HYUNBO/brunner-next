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
    // 로그아웃 후 추가 처리 가능
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leftMenuItems, setLeftMenuItems] = useState([]);

  // 섹션별 열림/닫힘 상태
  const [openSections, setOpenSections] = useState({});

  // 섹션 클릭 시 토글 함수
  const toggleSection = (label) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  useEffect(() => {
    const loadMenu = async () => {
      const items = await getLeftMenuItems();

      // 모든 section 기본 닫힘(false)으로 초기화
      const sections = items
        .filter((item) => item.type === "section")
        .reduce((acc, cur) => {
          acc[cur.label] = false;
          return acc;
        }, {});

      setOpenSections(sections);
      setLeftMenuItems(items);
    };
    loadMenu();
  }, [reloadSignal]);

  // 하위 메뉴인지 판단용 - parent가 section label임
  const getSectionLabel = (item) => item.parent || "";

  // 메뉴 렌더링
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
        <div className="absolute right-4 w-64 bg-white shadow-lg rounded z-50 dark:bg-slate-800 dark:text-gray-100">
          <ul className="p-2">
            {leftMenuItems.map((item, idx) => {
              if (item.type === "divider") {
                return <hr key={idx} className="my-2 border-gray-300" />;
              }

              if (item.type === "section") {
                return (
                  <li
                    key={idx}
                    className="font-semibold mt-3 cursor-pointer select-none flex items-center justify-between px-2 py-1"
                    onClick={() => toggleSection(item.label)}
                  >
                    <span>{item.label}</span>
                    <span>{openSections[item.label] ? "▼" : "▶"}</span>
                  </li>
                );
              }

              // 하위 메뉴인데 해당 섹션이 닫혀있으면 숨김
              const sectionLabel = getSectionLabel(item);
              if (sectionLabel && !openSections[sectionLabel]) return null;

              // 하위 메뉴 스타일
              if (item.type === "submenu" || item.type === "menu") {
                return (
                  <li
                    key={item.href + idx}
                    className="ml-4 px-2 py-1 text-sm hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                );
              }

              // 일반 메뉴
              return (
                <li
                  key={item.href + idx}
                  className="px-2 py-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-black"
                >
                  <Link href={item.href}>{item.label}</Link>
                </li>
              );
            })}
          </ul>
          <hr />
          <UserInfo handleLogout={handleLogout} />
        </div>
      )}
    </>
  );

  return (
    <header className="sticky top-0 left-0 right-0 w-full z-50 bg-white dark:bg-slate-800 text-gray-600 dark:text-white body-font md:w-2/3">
      <DivContainer className="relative flex items-center w-full max-w-full">
        {/* 로고 */}
        <Link
          href="/"
          className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
        >
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

        <div className="flex-1" />

        {/* 모바일 햄버거 메뉴 */}
        <div className="absolute top-4 right-4 z-50">{mobileDropdownMenu()}</div>

        {/* PC 메뉴는 필요하면 별도로 구현 */}
      </DivContainer>
    </header>
  );
}