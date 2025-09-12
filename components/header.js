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
          width={0}
          height={0}
          sizes="(max-width: 768px) 150px, 240px"
          className="w-[150px] sm:w-[240px] h-auto"
        />
      </Link>

      <div className="flex-1" />
    </div>
  </header>
  );
}