`use strict`;

import HomeContentAnimation from "./content-animation/homeContentAnimation";
import { useRouter } from "next/router";
import * as userInfo from "@/components/userInfo";
import DivContainer from "@/components/divContainer";
import { isMobile, isTablet, isBrowser } from "react-device-detect";
import GoverningMessage from "@/components/governingMessage";
import BrunnerBoard from "@/components/brunnerBoard";

export default function HomeContent() {
  const router = useRouter();

  return (
    <>
      <DivContainer className={`flex-row`}>
        <div className={`w-full items-center justify-center text-left`}>
          <h2 className={`title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900`}>
            Pelagos Voyager
          </h2>
          <GoverningMessage governingMessage={`사람의 생각은 무한하고 시시각각 변하지만 기억은 영원하지 않습니다. 
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
          <div className={`flex space-x-4 w-full h-full text-align-left mt-10 readonly`}>
            <BrunnerBoard boardType={'MAIN_TALK'} />
          </div>

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
