import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getDropdownMenuItems } from "@/components/core/client/frames/dropdownMenuitem";
import UserInfo from "@/components/core/client/frames/userInfo"; // 예시 import
import { getIsDarkMode } from "@/components/core/client/frames/darkModeToggleButton";

export default function DropdownMenu({ reloadSignal, triggermenureload }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [openSections, setOpenSections] = useState({});
  const menuRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const toggleSection = (label) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const getSectionLabel = (item) => item.parent || "";

  // depth 계산 함수 (section 아래 메뉴도 포함)
  const getItemDepth = (item, items) => {
    let depth = 0;
    let current = item;
    while (current.parent) {
      depth++;
      current = items.find((i) => i.label === current.parent);
      if (!current) break;
    }
    return depth;
  };

  const handleLogout = async () => {
    if (triggermenureload) triggermenureload();
    const items = await getDropdownMenuItems();
    setMenuItems(items);
  };

  return (
    <>
      <button
        className="p-2 dark-bg-color semi-text-color"
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
          className="text-gray-700 
                     semi-text-color"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {mobileMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-4 shadow-lg rounded-md z-50 semi-text-bg-color min-w-max"
        >
          <ul>
            {menuItems.map((item, idx) => {
              if (item.type === "divider") {
                return (
                  <hr
                    key={idx}
                    className="border-gray-300 
                                      dark:border-gray-600"
                  />
                );
              }

              if (item.type === "section") {
                return (
                  <li
                    key={idx}
                    className="cursor-pointer 
                               select-none flex 
                               items-center 
                               justify-between 
                               px-5 py-2 
                               hover:bg-gray-300 
                               dark:hover:bg-gray-600"
                    onClick={() => toggleSection(item.label)}
                  >
                    <span className="text-gray-800 dark:text-gray-200 px-2">
                      {item.label}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 px-2">
                      {openSections[item.label] ? "▼" : "▶"}
                    </span>
                  </li>
                );
              }

              const sectionLabel = getSectionLabel(item);
              if (sectionLabel && !openSections[sectionLabel]) return null;

              const depth = getItemDepth(item, menuItems);

              return (
                <li key={item.href + idx}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)} // 여기 추가
                    className="block px-5 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white rounded-md whitespace-nowrap"
                    style={{ paddingLeft: `${16 * (depth + 1)}px` }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <hr className="border-gray-300 dark:border-gray-600" />
          <UserInfo
            handleLogout={handleLogout}
            triggermenureload={triggermenureload}
          />
        </div>
      )}
    </>
  );
}
