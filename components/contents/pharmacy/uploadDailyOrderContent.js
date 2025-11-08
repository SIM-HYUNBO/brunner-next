`use strict`;

import { useState, useRef, useEffect } from "react";
import { useDeviceType } from "@/components/core/commonFunctions";
import GoverningMessage from "@/components/core/client/governingMessage";
import LottiePlayer from "@/components/core/client/lottiePlayer";
import { DailyOrderUploader } from "./dailyOrderUploader";
import DailyOrderViewer from "./dailyOrderViewer";

export default function UploadDailyOrderContent() {
  const { isMobile, isTablet } = useDeviceType();

  return (
    <>
      <div>
        <div className={`w-full items-start text-left`}>
          <h2 className={`page-title`}>Upload Daily Order</h2>
          <GoverningMessage
            governingMessage={"Select daily order file to upload."}
          />
          <div className={`flex justify-center mt-5`}>
            <DailyOrderUploader />
          </div>
          <div className={`flex justify-center mt-5`}>
            <DailyOrderViewer />
          </div>
        </div>
      </div>
    </>
  );
}
