import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as userInfo from "@/components/userInfo";
import DivContainer from "@/components/divContainer";
import DropdownMenu from "./dropdownMenu";


export default function Header({ triggerMenuReload, reloadSignal }) {
  const UserInfo = userInfo.default;

  return (
    <header className="sticky top-0 left-0 right-0 w-full z-50 bg-white dark:bg-slate-800 text-gray-600 dark:text-white body-font md:w-2/3">
      <DivContainer className="relative flex items-center w-full max-w-full">
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

        {/* 햄버거 메뉴 */}
        <div className="absolute top-4 right-4 z-50">
          <DropdownMenu triggerMenuReload={triggerMenuReload} reloadSignal={reloadSignal} />
        </div>
      </DivContainer>
    </header>
  );
}