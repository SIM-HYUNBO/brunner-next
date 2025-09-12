import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as userInfo from "@/components/userInfo";
// import DivContainer from "@/components/div";
import DropdownMenu from "@/components/dropdownMenu";


export default function Header({ triggerMenuReload, reloadSignal }) {
  const UserInfo = userInfo.default;

  return (
  
    <header className="header">

  {/* 햄버거 메뉴 */}
    <div className="absolute top-4 right-4 z-50">
      <DropdownMenu triggerMenuReload={triggerMenuReload} reloadSignal={reloadSignal} />
    </div>

    {/* 전체 너비로 확장된 컨테이너 */}
    <div className="">
      {/* 로고 */}
      <Link href="/" className="inline-block">
        <Image
          src="/favicon.png"
          alt="brunner logo"
          priority
          width={240} height={240} /* 확보하는 영역의 크기 */
          sizes="(max-width: 768px) 150px, 240px" /* 화면 폭에 따라 반응형 이미지 로딩 최적화 힌트, 768px 보다 작을떄와 클때 구분 */
          className="ml-5 w-[140px] sm:w-[280px] h-auto" /* 로드되는 이미지의 실제 해상도 선택 */
        />
      </Link>

      <div className="flex-1" />
    </div>
  </header>
  );
}