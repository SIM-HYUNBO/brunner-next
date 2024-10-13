`use strict`

import ContactContentAnimation from './content-animation/contactContentAnimation'
import { useRouter } from 'next/router'
import DivContainer from "@/components/DivContainer"

export default function ContactContent() {
  const router = useRouter()

  return (
    <>
      <DivContainer className="mobile:flex-row desktop:flex-col">
        <div className="mobile:w-full desktop:w-1/2 items-start text-left">
          <h2 className="title-font 
                       sm:text-4xl 
                       text-3xl 
                       mb-10 
                       font-medium 
                       text-green-900">
            We are here for you always.
          </h2>
          <div className="main-governing-text">
            Brunner's call center is always available to assist investors.
            Contact us immediately
          </div>
          <div className="flex justify-center">
            <GetContact />
          </div>
        </div>
        <div className="w-full desktop:p-20">
          {<ContactContentAnimation />}
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
  )
}