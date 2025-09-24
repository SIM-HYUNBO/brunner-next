import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DropdownMenu from "@/components/core/client/frames/dropdownMenu";

export default function Header({ triggermenureload, reloadSignal }) {
  return (
    <header className="header">
      {/* 햄버거 메뉴 */}
      <div className="absolute top-0 right-0 z-50">
        <DropdownMenu
          triggermenureload={triggermenureload}
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
            width={100}
            height={100} /* 확보하는 영역의 크기 */
            sizes="(max-width: 768px) 150px, 150px" /* 화면 폭에 따라 반응형 이미지 로딩 최적화 힌트, 768px 보다 작을떄와 클때 구분 */
            className="ml-5 w-[120px] sm:w-[150px] h-auto" /* 로드되는 이미지의 해상도 선택 */
          />
        </Link>

        <div className="flex-1" />
      </div>
    </header>
  );
}
