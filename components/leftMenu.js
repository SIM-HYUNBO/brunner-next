import { useEffect, useState } from "react";
import Link from "next/link";
import { useDeviceType } from "@/components/commonFunctions";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import RequestServer from "@/components/requestServer";
import { getLeftMenuItems } from "@/components/leftMenuItems";

export default function LeftMenu({ reloadSignal }) {
  const { isMobile, isTablet } = useDeviceType();
  const [groupedMenuItems, setGroupedMenuItems] = useState([]);

  useEffect(() => {
    getLeftMenuItems().then((items) => {
      const grouped = [];
      let currentSection = null;

      for (const item of items) {
        if (item.type === "section") {
          currentSection = { ...item, children: [] };
          grouped.push(currentSection);
        } else if (item.type === "divider") {
          grouped.push({ type: "divider" });
          currentSection = null;
        } else {
          if (currentSection) {
            currentSection.children.push(item);
          } else {
            // 섹션 없는 단일 항목도 허용
            grouped.push(item);
          }
        }
      }

      setGroupedMenuItems(grouped);
    });
  }, [reloadSignal]);

  return (
    <>
      {!isMobile && !isTablet && (
        <aside className="dark:bg-slate-800 pt-32 w-48 desktop:pt-32 desktop:w-48 mx-20">
          <nav className="fixed">
            <ul>
              {groupedMenuItems.map((item, idx) => {
                if (item.type === "divider") {
                  return <hr key={`divider-${idx}`} className="my-4 border-gray-400" />;
                } else if (item.type === "section") {
                  return (
                    <li key={`section-${idx}`}>
                      <div className="text-gray-500 dark:text-gray-300 py-1">{item.label}</div>
                      <ul className="pl-4">
                        {item.children.map((child, cidx) => (
                          <li key={`item-${cidx}`}>
                            <Link
                              href={child.href}
                              className="block text-gray-600 dark:text-gray-100 py-2"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                } else {
                  // 섹션 없이 오는 개별 항목
                  return (
                    <li key={`single-${idx}`}>
                      <Link
                        href={item.href}
                        className="block text-gray-600 dark:text-gray-100 py-2"
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
          </nav>
        </aside>
      )}
    </>
  );
}