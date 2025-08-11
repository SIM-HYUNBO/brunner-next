`use strict`;

import { useDeviceType } from "@/components/commonFunctions"
import ServiceSQL from "@/components/serviceSQL";
import AdminContentAnimation from "./content-animation/adminContentAnimation";
import * as userInfo from "@/components/userInfo";
// import DivContainer from "@/components/div";

export default function AdminContent() {
  const { isMobile, isTablet } = useDeviceType();

  return (
    <>
      <div>
        {userInfo?.isAdminUser() && (
          <>
            <h2 className={`page-title`}>
              Service SQL  
            </h2>
            <div className={`flex justify-center w-full`}>
              <ServiceSQL />
            </div>
           {!isMobile && (
              <div className={`items-center`}>
                {<AdminContentAnimation width={300} height={300} />}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}