`use strict`;

import DivContainer from "@/components/divContainer";
import BrunnerVideo from "@/components/brunnerVideo";
import { isMobile, isTablet, isBrowser } from "react-device-detect";
import GoverningMessage from "@/components/governingMessage";

export default function ClipsContent() {
  return (
    <>
      <DivContainer className="flex-row desktop:flex-col">
        <div className="w-full desktop:w-2/3 items-start text-left">
          <h2
            className="title-font 
                       text-3xl 
                       mb-10 
                       font-medium 
                       text-green-900"
          >
            Videos that help life.
          </h2>
          <GoverningMessage governingMessage="The video clips that may be helpful in our life & mental training." />
          <div className="flex">
            <div className="w-full">
              <BrunnerVideo
                url={"https://youtu.be/MddvuCH-XUU"}
                title={"S&P500 INDEX FUND."}
                width="800px" // 100%
                height="450px" // 100%
                className="mt-5"
              ></BrunnerVideo>
              <BrunnerVideo
                url={
                  "https://youtu.be/yUYzp_wNpks?t=10"
                }
                title={`S&P500 Cycles last 96 years.`}
                width="800px" // 100%
                height="450px" // 100%
                className="mt-5"
              ></BrunnerVideo>
              <BrunnerVideo
                url={
                  "https://youtu.be/EIPl5Ml6wSk?t=8"
                }
                title={`The rule of 4%.`}
                width="800px" // 100%
                height="450px"
                className="mt-5" // 100%
              ></BrunnerVideo>
            </div>
          </div>
        </div>
        {!isMobile && (
          <div className="items-center">
            {/* {<ClipsContentAnimation />} */}
          </div>
        )}
      </DivContainer>
    </>
  );
}
