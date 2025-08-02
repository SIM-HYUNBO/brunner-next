`use strict`;

import { useDeviceType } from "@/components/commonFunctions"
import ServiceSQL from "@/components/serviceSQL";
import AdminContentAnimation from "./content-animation/adminContentAnimation";
import * as userInfo from "@/components/userInfo";
import DivContainer from "@/components/divContainer";

export default function AdminContent() {
  const { isMobile, isTablet } = useDeviceType();

  return (
    <>
      <DivContainer>
        {userInfo?.isAdminUser() && (
          <>
            <h2 className={`page-title`}>
              Brunner administration
            </h2>
            <div className={`flex justify-center`}>
              <ServiceSQL />
            </div>
           {!isMobile && (
              <div className={`items-center`}>
                {<AdminContentAnimation width={300} height={300} />}
              </div>
            )}
          </>
        )}
      </DivContainer>
    </>
  );
}

export function GetContact() {
  return (
    <>
      <div className={`px-5 py-2 mr-2 bg-indigo-500`}>
        <a href={`tel:82-10-7544-8698`}>Mobile</a>
      </div>
      <br />
      <div className={`px-5 py-2 mr-2 bg-indigo-500`}>
        <a href="mailto:hbsim0605@gmail.com">Mail</a>
      </div>
    </>
  );
}
