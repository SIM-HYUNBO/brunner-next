`use strict`;

import { useDeviceType } from "@/components/commonFunctions"
import HomeContentAnimation from "./content-animation/homeContentAnimation";
import { useRouter } from "next/router";
import * as userInfo from "@/components/userInfo";
import DivContainer from "@/components/divContainer";
import GoverningMessage from "@/components/governingMessage";
import BrunnerBoard from "@/components/brunnerBoard";

export default function HomeContent() {
  const router = useRouter();
  const { isMobile, isTablet } = useDeviceType();

  return (
    <>
      <DivContainer className={`flex-row`}>
        <h2 className={`page-title`}>
          Noesis Pelagos
        </h2>
        <GoverningMessage governingMessage={`생각은 무한하고 시시각각 변하지만 기억은 영원하지 않습니다. 
        그래서 생각은 기록으로 남기고 보전해야 합니다. 
        무한한 당신의 생각을 디지털 기록으로 보관하세요.`} />
        
        <div className={`flex flex-col mt-20`}>
          {!userInfo.isLogin() && (
            <div>
              <button
                className={`inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg mr-2`}
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
        {!isMobile && (
          <div className={`items-center`}>
            <HomeContentAnimation width={300} height={300} />
          </div>
        )}
      </DivContainer>
    </>
  );
}
