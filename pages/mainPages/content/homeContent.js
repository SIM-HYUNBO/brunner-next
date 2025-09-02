`use strict`;

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDeviceType } from "@/components/commonFunctions"
import HomeContentAnimation from "./content-animation/homeContentAnimation";
import * as userInfo from "@/components/userInfo";
import DivContainer from "@/components/divContainer";
import GoverningMessage from "@/components/governingMessage";
import BrunnerBoard from "@/components/brunnerBoard";

export default function HomeContent() {
  const router = useRouter();
  const { isMobile, isTablet } = useDeviceType();
  const [isMounted, setIsMounted ] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  } , []);
  
  return (
    <>
      <DivContainer className={`flex-row`}>
        <h2 className={`px-5 page-title`}>
          Noesis Pelagos
        </h2>
        <div className="w-full flex flex-row items-center">
          <div className="flex-1">
          <GoverningMessage governingMessage={`Thoughts are finite, but records are eternal.
  Leave your ideas as digital documents.
  Creation begins the moment you start recording.

  Personal use of Brunner's services is free. 
  Sign up to try it out.`} />
          </div>
          {!isMobile && (
            <div className={`items-center`}>
              <HomeContentAnimation width={300} height={300} />
            </div>
          )}
        </div>
        <div className={`flex flex-col mt-20`}>
          {isMounted && !userInfo.isLogin() && (
            <div className ="flex space-x-1">
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
            </div>
          )}
        </div>
        <div className={`flex w-full mt-10 px-2 readonly`}>
          <BrunnerBoard boardType={'MAIN_TALK'} />
        </div>
      </DivContainer>
    </>
  );
}
