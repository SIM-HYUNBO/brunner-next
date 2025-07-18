`use strict`;

import HomeContentAnimation from "./content-animation/homeContentAnimation";
import { useRouter } from "next/router";
import * as userInfo from "@/components/userInfo";
import DivContainer from "@/components/divContainer";
import BrunnerVideo from "@/components/brunnerVideo";
import { isMobile, isTablet, isBrowser } from "react-device-detect";
import GoverningMessage from "@/components/governingMessage";


export default function HomeContent() {
  const router = useRouter();

  return (
    <>
      <DivContainer className={`flex-row`}>
        <div className={`w-full desktop:w-2/3 items-start text-left`}>
          <h2 className={`title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900`}>
            DIY Site
          </h2>
          <GoverningMessage governingMessage={"사용자가 직접 만드는 사이트입니다.. \n무료 가입 후 페이지 디자이너로 직접 페이지를 만들어보세요.\n"} />
          <div className={`flex flex-col`}>
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
