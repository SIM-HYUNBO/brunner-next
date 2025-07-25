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
            <div className={`w-full pr-16 flex flex-col items-start text-left md:mb-0 mb-20`}>
              <h2 className={`title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900`}>
                Brunner administration
              </h2>
              <div className={`flex justify-center`}>
                <ServiceSQL />
              </div>
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
