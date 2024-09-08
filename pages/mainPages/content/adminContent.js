`use strict`

import ServiceSQL from '@/components/serviceSQL';
import AdminContentAnimation from './content-animation/adminContentAnimation'
import { useRouter } from 'next/router'
import * as userInfo from '@/components/userInfo';
import PageContainer from "@/components/pageContainer"

export default function AdminContent() {
  const router = useRouter()

  return (
    <>
      <PageContainer>
        {userInfo?.isAdminUser() &&
          <>
            <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center mb-20">
              <h1 className="title-font 
                       sm:text-4xl 
                       text-3xl 
                       mb-10 
                       font-medium 
                       text-green-900">
                Brunner administration.
              </h1>
              <div className="flex justify-center">
                <ServiceSQL />
              </div>
            </div>
            <div className="lg:h-2/6 lg:w-2/6">
              {<AdminContentAnimation />}
            </div>
          </>
        }
      </PageContainer>
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