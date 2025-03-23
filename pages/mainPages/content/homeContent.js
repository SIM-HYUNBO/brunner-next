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
      <DivContainer className="flex-row ">
        <div className="w-full desktop:w-2/3 items-start text-left">
          <h2 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
            Asset management
          </h2>
          <GoverningMessage governingMessage={"The key to success in wealth and the stock market is ... \n consistent market participation and smart management.\n\nManage your assets well and stay engaged in the stock market by using Brunner-Next.\n"} />
          <div className="flex flex-col">
            <div className="dark:text-slate-400 mb-2">
              Enjoy using Brunner in a safer and more convenient way.
            </div>
            {!userInfo.isLogin() && (
              <div>
                <button
                  className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg mr-2"
                  onClick={() => router.push("/mainPages/signin")}
                >
                  Sign in
                </button>
                <button
                  className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                  onClick={() => router.push("/mainPages/signup")}
                >
                  Sign up
                </button>
              </div>
            )}
            <div className="mt-10">
              <BrunnerVideo
                url={"https://youtu.be/0j1BdlsL_ew?t=2"}
                title="The powerful effect of S&P500"
              ></BrunnerVideo>
            </div>
          </div>
        </div>
        {!isMobile && (
          <div className="items-center">
            <HomeContentAnimation width={300} height={300} />
          </div>
        )}
      </DivContainer>
    </>
  );
}
