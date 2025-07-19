import { useEffect, useState } from "react";
import Link from "next/link";
import { isMobile } from 'react-device-detect';
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import RequestServer from "@/components/requestServer";
import { getLeftMenuItems } from "@/components/leftMenuItems"; // 추가

export default function LeftMenu({ reloadSignal }) {
  const [leftMenuItems, setLeftMenuItems] = useState([]);

  useEffect(() => {
    getLeftMenuItems().then(setLeftMenuItems);
  }, [reloadSignal]);

  return (
    <>
      {!isMobile && (
        <aside className={`dark:bg-slate-800 px-2 pt-32 w-48 desktop:px-4 desktop:pt-32 desktop:w-48`}>
          <nav className={`fixed`}>
            <ul>
             {leftMenuItems.map((item, idx) =>
              item.type === "divider" ? (
                <hr key={idx} className="my-4 border-gray-400" />
              ) : item.type === "section" ? (
                <li key={idx} className="text-gray-500 dark:text-gray-300 py-1">{item.label}</li>
              ) : (
                <Link
                  key={item.href + idx}
                  href={item.href}
                  className="block text-gray-600 dark:text-gray-100 py-2"
                >
                  {item.label}
                </Link>
              )
            )}
            </ul>
          </nav>
        </aside>
      )}
    </>
  );
}