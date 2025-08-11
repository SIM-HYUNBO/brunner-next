`use strict`;

import React, { useEffect, useState } from "react";
import { useDeviceType } from "@/components/commonFunctions"
import HomeContentAnimation from "./content-animation/homeContentAnimation";
import { useRouter } from "next/router";
import * as userInfo from "@/components/userInfo";
// import DivContainer from "@/components/div";
import GoverningMessage from "@/components/governingMessage";
import BrunnerBoard from "@/components/brunnerBoard";
import { use } from "react";

export default function HomeContent() {
  const router = useRouter();
  const { isMobile, isTablet } = useDeviceType();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className={`flex-row`}>
        <h2 className={`page-title`}>
          Noesis Pelagos
        </h2>
        <GoverningMessage governingMessage={`Thoughts are finite, but records are eternal.
Leave your ideas as digital documents.
Creation begins the moment you start recording.`} />
        
        <div className={`flex flex-col mt-20`}>
          {mounted && !userInfo.isLogin() && (
            <>
              <button
                className={`inline-flex 
                            text-white 
                            bg-indigo-500 
                            border-0 
                            py-2 px-6 
                            focus:outline-none 
                            hover:bg-indigo-600 
                            rounded 
                            text-lg 
                            mr-1`}
                onClick={() => router.push("/mainPages/signin")}
              >
                Sign in
              </button>
              <button
                className={`inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg`}
                onClick={() => router.push("/mainPages/signup")}
              >
                Sign up
              </button>
            </>
          )}
        </div>
        <div className={`flex w-full mt-10 px-2 readonly`}>
          <BrunnerBoard boardType={'MAIN_TALK'} />
        </div>
        {!isMobile && (
          <div className={`items-center`}>
            <HomeContentAnimation width={300} height={300} />
          </div>
        )}
      </div>
    </>
  );
}
