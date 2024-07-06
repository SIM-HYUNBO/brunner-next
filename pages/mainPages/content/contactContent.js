`use strict`

import ContactContentAnimation from './content-animation/contactContentAnimation'
import { useRouter } from 'next/router'

export default function ContactContent() {
  const router = useRouter()

  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          언제나 환영합니다.
        </h1>
        <div className="main-governing-text">
          지금 바로 참여하십시요. <br /><br />
          문의: hbsim0605@gmail.com <br />
          전화: 010-7544-8698
        </div>
        <div className="flex justify-center space-x-4">
          <button className="inline-flex 
                       text-white 
                       bg-indigo-500 
                         border-0 
                         py-2 
                         px-6 
                         focus:outline-none 
                       hover:bg-indigo-600 
                         rounded 
                         text-lg">
            <GetQuestion />
          </button>
          <button className="inline-flex 
                            text-white 
                            bg-indigo-500 
                             border-0 
                             py-2 
                             px-6 
                             focus:outline-none 
                             hover:bg-indigo-600 
                             rounded 
                             text-lg">
            <GetCallCenter />
          </button>
        </div>
      </div>
      <div className="lg:h-2/6 lg:w-2/6">
        <ContactContentAnimation />
      </div>
    </>
  );
}

export function GetQuestion() {
  return (
    <a className="text-white-900" href={`mailto:kkhw1202@gmail.com`}>By E-Mail</a>
  )
}

export function GetCallCenter() {
  return (
    <a className="text-white-900" href={`tel:01075448698`}>By Phone</a>
  )
}