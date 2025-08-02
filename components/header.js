import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as userInfo from "@/components/userInfo";
import DivContainer from "@/components/divContainer";
import DropdownMenu from "@/components/dropdownMenu";


export default function Header({ triggerMenuReload, reloadSignal }) {
  const UserInfo = userInfo.default;

  return (
  <header className="sticky top-0 left-0 right-0 w-full z-50 bg-white dark:bg-slate-800 text-gray-600 dark:text-white body-font relative">
  {/* 햄버거 메뉴 */}
    <div className="absolute top-4 right-4 z-50">
      <DropdownMenu triggerMenuReload={triggerMenuReload} reloadSignal={reloadSignal} />
    </div>

    {/* 전체 너비로 확장된 컨테이너 */}
    <DivContainer className="flex items-center w-full px-4">
      {/* 로고 */}
      <Link
        href="/"
        className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
      >
        <Image
          src="/brunnerLogo202507.png"
          alt="brunner logo"
          priority
          width={0}
          height={0}
          sizes="(max-width: 768px) 150px, 240px"
          className="w-[150px] sm:w-[240px] h-auto"
        />
      </Link>

      <div className="flex-1" />
    </DivContainer>
  </header>
  );
}