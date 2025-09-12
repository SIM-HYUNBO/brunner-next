import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DropdownMenu from "@/components/dropdownMenu";

export default function Header({ triggerMenuReload, reloadSignal }) {
  return (
    <header className="header">
      {/* 햄버거 메뉴 */}
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu
          triggerMenuReload={triggerMenuReload}
          reloadSignal={reloadSignal}
        />
      </div>

      {/* 전체 너비로 확장된 컨테이너 */}
      <div className="">
        {/* 로고 */}
        <Link href="/" className="inline-block">
          <Image
            src="/favicon.png"
            alt="brunner logo"
            priority
            width={200}
            height={200} /* 확보하는 영역의 크기 */
            sizes="(max-width: 768px) 150px, 240px" /* 화면 폭에 따라 반응형 이미지 로딩 최적화 힌트, 768px 보다 작을떄와 클때 구분 */
            className="ml-5 w-[150px] sm:w-[210px] h-auto" /* 로드되는 이미지의 해상도 선택 */
          />
        </Link>

        <div className="flex-1" />
      </div>
    </header>
  );
}
