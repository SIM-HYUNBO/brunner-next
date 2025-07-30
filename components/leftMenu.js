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
        <aside className="dark:bg-slate-800 pt-32 w-48 desktop:pt-32 desktop:w-48 mx-20">
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
                      className="text-gray-500 dark:text-gray-300 py-2 font-semibold cursor-pointer select-none"
                      onClick={() => toggleSection(item.label)}
                    >
                      {/* 화살표 아이콘 */}
                      <span className="inline-block mr-1">
                        {openSections[item.label] ? "▼" : "▶"}
                      </span>
                      {item.label}
                    </li>
                  );
                }

                // section이 있고, 해당 섹션이 닫혀있으면 렌더링 안 함
                const sectionLabel = getSectionLabel(item);
                if (sectionLabel && !openSections[sectionLabel]) {
                  return null;
                }

                // 일반 메뉴 아이템 렌더링
                return (
                  <li key={item.href + idx} className="list-none">
                    <Link
                      href={item.href}
                      className="block text-gray-900 dark:text-gray-100 py-2 pl-6 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
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