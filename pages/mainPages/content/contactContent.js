`use strict`

import ContactContentAnimation from './content-animation/supportContentAnimation'
import { useRouter } from 'next/router'
import Container from "@/components/container"

export default function ContactContent() {
  const router = useRouter()

  return (
    <>
      <Container className="md:flex-row flex-col">
        <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center mb-20">
          <h1 className="title-font 
                       sm:text-4xl 
                       text-3xl 
                       mb-10 
                       font-medium 
                       text-green-900">
            Here for you always.
          </h1>
          <div className="main-governing-text">
            Brunner's call center is always available to assist investors.
            Contact us immediately
          </div>
          <div className="flex justify-center">
            <GetContact />
          </div>
        </div>
        <div className="lg:h-2/6 lg:w-2/6">
          {<ContactContentAnimation />}
        </div>
      </Container>
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