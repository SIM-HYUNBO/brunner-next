"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getDropdownMenuItems } from "@/components/core/client/frames/dropdownMenuitem";
import UserInfo from "@/components/core/client/frames/userInfo";

export default function DropdownMenu({ reloadSignal, triggermenureload }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [openSections, setOpenSections] = useState({});
  const menuRef = useRef(null);

  useEffect(() => {
    const loadMenu = async () => {
      const items = await getDropdownMenuItems();
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const toggleSection = (label) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const getSectionLabel = (item) => item.parent || "";

  const getItemDepth = (item, items) => {
    let depth = 0;
    let current = item;
    while (current.parent) {
      depth++;
      const parentItem = items.find((i) => i.label === current.parent);
      if (!parentItem) break;
      current = parentItem;
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
      {/* 햄버거 버튼 */}
      <button
        className="p-2 rounded-md transition-colors"
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
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {mobileMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-4 mt-2 shadow-lg rounded-md z-50 min-w-[220px]"
        >
          <ul className="divide-y">
            {menuItems.map((item, idx) => {
              if (item.type === "divider") return <hr key={idx} className="" />;

              if (item.type === "section") {
                return (
                  <li
                    key={idx}
                    className="cursor-pointer select-none flex items-center justify-between px-4 py-2 rounded-md  transition-colors"
                    onClick={() => toggleSection(item.label)}
                  >
                    <span>{item.label}</span>
                    <span className="">
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
                    onClick={() => setMobileMenuOpen(false)}
                    className={`semi-text-bg-color block px-4 py-2 text-sm rounded-md transition-colors`}
                    style={{ paddingLeft: `${16 * (depth + 1)}px` }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <hr className="" />

          <div className="p-3 semi-text-bg-color">
            <UserInfo
              handleLogout={handleLogout}
              triggermenureload={triggermenureload}
            />
          </div>
        </div>
      )}
    </>
  );
}
