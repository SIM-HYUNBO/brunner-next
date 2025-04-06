`use strict`;

import ContactContentAnimation from "./content-animation/contactContentAnimation";
import DivContainer from "@/components/divContainer";
import { isMobile, isTablet, isBrowser } from "react-device-detect";
import GoverningMessage from "@/components/governingMessage";

import BrunnerWebcamStream from '@/components/brunnerWebcamStream';

export default function ContactContent() {
  
  return (
    <>
      <DivContainer>
        <div className="w-full desktop:w-2/3 items-start text-left">
          <h2 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
            We are here for you always.
          </h2>
          <GoverningMessage governingMessage={"Brunner's call center is always available to assist investors.\nContact us immediately"} />
          <div className="flex justify-center">
            <GetContact />
          </div>
        </div>
        {!isMobile && (
          <div className="items-center">
            {<ContactContentAnimation width={300} height={300} />}
          </div>
        )}
        <div className="w-full flex justify-start mt-10">
          <BrunnerWebcamStream title="Brunner admin studio" />
        </div>        
      </DivContainer>
    </>
  );
}

export function GetContact() {
  return (
    <>
      <div className="px-5 py-2 mr-2 bg-indigo-500">
        <a href={`tel:82-10-7544-8698`}>Mobile</a>
      </div>
      <br />
      <div className="px-5 py-2 mr-2 bg-indigo-500">
        <a href="mailto:hbsim0605@gmail.com">Mail</a>
      </div>
    </>
  );
}
