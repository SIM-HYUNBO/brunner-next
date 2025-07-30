import { useEffect, useState } from "react";
import Link from "next/link";
import { useDeviceType } from "@/components/commonFunctions";
import { getLeftMenuItems } from "@/components/leftMenuItems";

export default function LeftMenu({ reloadSignal }) {
  const { isMobile, isTablet } = useDeviceType();
  const [leftMenuItems, setLeftMenuItems] = useState([]);

  // 섹션별 열림/닫힘 상태 저장 (label 기준)
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

      // 모든 section을 기본 닫힘(false) 상태로 초기화
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
  
  
  // 각 메뉴가 속한 섹션 라벨 구하기 (없으면 빈문자열)
  // getLeftMenuItems에서 parent가 section label로 주어져야 합니다
  const getSectionLabel = (item) => item.parent || "";
 
  return (
    <>
      {!isMobile && !isTablet && (
      <aside className="bg-gray-100 dark:bg-slate-800 pt-32 w-48 desktop:pt-32 desktop:w-48 mx-20">
  <nav className="fixed">
    <ul className="list-none p-0 m-0">
      {leftMenuItems.map((item, idx) => {
        if (item.type === "divider") {
          return <hr key={idx} className="my-4 border-gray-400" />;
        }

        if (item.type === "section") {
          return (
            <li
              key={idx}
              className="text-gray-700 dark:text-gray-300 py-2 font-semibold cursor-pointer select-none"
              onClick={() => toggleSection(item.label)}
            >
              <span className="inline-block mr-1">
                {openSections[item.label] ? "▼" : "▶"}
              </span>
              {item.label}
            </li>
          );
        }

        const sectionLabel = getSectionLabel(item);
        if (sectionLabel && !openSections[sectionLabel]) return null;

        return (
          <li key={item.href + idx} className="py-2">
            <Link
              href={item.href}
              className="block text-gray-800 dark:text-gray-100 py-2 pl-6 hover:bg-gray-300 dark:hover:bg-slate-700 rounded"
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  </nav>
</aside>
      )}
    </>
  );
}