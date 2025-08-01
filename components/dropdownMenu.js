import { useEffect, useState } from "react";
import Link from "next/link";
import { getDropdownMenuItems } from "@/components/dropdownMenuitem";
import UserInfo from "@/components/userInfo"; // 예시 import
import { useTheme } from 'next-themes';
import { getIsDarkMode } from '@/components/darkModeToggleButton';

export default function DropdownMenu({ reloadSignal, triggerMenuReload }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [openSections, setOpenSections] = useState({});
  
  useEffect(() => {
    const loadMenu = async () => {
      const items = await getDropdownMenuItems();

      // 모든 section 기본 닫힘(false)으로 초기화
      const sections = items
        .filter((item) => item.type === "section")
        .reduce((acc, cur) => {
          acc[cur.label] = false;
          return acc;
        }, {});

      setOpenSections(sections);
      setMenuItems(items);
    };
    loadMenu();
  }, [reloadSignal]);

  const toggleSection = (label) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const getSectionLabel = (item) => item.parent || "";

  const handleLogout = async () => {
    if (triggerMenuReload) triggerMenuReload();
    
    // 로그아웃 후 추가 처리 가능
    const items = await getDropdownMenuItems();
    setMenuItems(items);
  };

  return (
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
        <div className="absolute 
                        right-4 
                        w-42 
                        shadow-lg 
                        rounded 
                        z-50 
                        bg-slate-100
                        text-gray-800
                        dark:bg-slate-800 
                        dark:text-gray-100">
          <ul>
            {menuItems.map((item, idx) => {
              if (item.type === "divider") {
                return <hr key={idx} className="border-gray-300" />;
              }

              if (item.type === "section") {
                return (
                  <li
                    key={idx}
                    className="cursor-pointer 
                               select-none 
                               flex 
                               items-center 
                               justify-between"
                    onClick={() => toggleSection(item.label)}
                  >
                    <span>{item.label}</span>
                    <span>{openSections[item.label] ? "▼" : "▶"}</span>
                  </li>
                );
              }

              const sectionLabel = getSectionLabel(item);
              if (sectionLabel && !openSections[sectionLabel]) return null;

              
              const menuStyle = {
                  color: getIsDarkMode() ? 'white' : 'black',
                  padding: '8px',
                  textDecoration: 'none',
                };

              return (
                <li key={item.href + idx}>
                  <a href={item.href} style={menuStyle}>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <hr />
          <UserInfo handleLogout={handleLogout} triggerMenuReload={triggerMenuReload} />
        </div>
      )}
    </>
  );
}