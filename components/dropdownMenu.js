// 중요: 반드시 'use client' 선언 필요
'use client';

import { useEffect, useState } from "react";
import { getDropdownMenuItems } from "@/components/dropdownMenuitem";
import UserInfo from "@/components/userInfo";
import { getIsDarkMode } from '@/components/darkModeToggleButton';

export default function DropdownMenu({ reloadSignal, triggerMenuReload }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [openSections, setOpenSections] = useState({});

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

  const toggleSection = (label) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const getSectionLabel = (item) => item.parent || "";

  const handleLogout = () => {
    if (triggerMenuReload) triggerMenuReload();
  };

  return (
    <>
      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>

      {mobileMenuOpen && (
        <div className="absolute right-4 w-64 bg-white shadow-lg rounded z-50 dark:bg-slate-800 dark:text-gray-100">
          <ul className="p-2">
            {menuItems.map((item, idx) => {
              if (item.type === "divider") {
                return <hr key={idx} className="my-2 border-gray-300" />;
              }

              if (item.type === "section") {
                return (
                  <li key={idx} className="font-semibold cursor-pointer select-none flex justify-between" onClick={() => toggleSection(item.label)}>
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