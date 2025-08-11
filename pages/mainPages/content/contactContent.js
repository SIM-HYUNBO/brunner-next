`use strict`;

import { useState, useRef, useEffect } from 'react';
import { useDeviceType } from "@/components/commonFunctions"
import ContactContentAnimation from "./content-animation/contactContentAnimation";
// import DivContainer from "@/components/div";
import GoverningMessage from "@/components/governingMessage";

export default function ContactContent() {
  const { isMobile, isTablet } = useDeviceType();

  return (
    <>
      <div>
        <div className={`w-full desktop:w-2/3 items-start text-left`}>
          <h2 className={`page-title`}>
            Contact us ...
          </h2>
          <GoverningMessage governingMessage={"Brunner's call center is always available to assist investors.\nContact us immediately"} />
          <div className={`flex justify-center mt-5`}>
            <GetContact />
          </div>
        </div>
        {!isMobile && (
          <div className={`items-center`}>
            {<ContactContentAnimation width={300} height={300} />}
          </div>
        )}
      </div>
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
