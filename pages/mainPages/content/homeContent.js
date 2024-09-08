`use strict`

import HomeContentAnimation from './content-animation/homeContentAnimation'
import { useRouter } from 'next/router'
import * as userInfo from '@/components/userInfo'
import AssetContent from './assetContent'
import PageContainer from "@/components/pageContainer"

export default function HomeContent() {
  const router = useRouter()

  return (
    <>
      <PageContainer>
        <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
            Asset management
          </h1>
          <div className="main-governing-text">
            The key to success in wealth and the stock market is consistent market participation and smart management. <br />
            Manage your assets well and stay engaged in the stock market by using Brunner-Next.<br />
            Stay in the market, connect and get rich with Brunner-Next.
          </div>
          <div className="flex flex-col">
            <div className="dark:text-slate-400 mb-2">
              Enjoy using Brunner in a safer and more convenient way.
            </div>
            {(!userInfo.isLogin()) && <div>
              <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg mr-2"
                onClick={() => router.push('/mainPages/signin')} >
                Sign in
              </button>
              <button
                className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                onClick={() => router.push('/mainPages/signup')} >
                Sign up
              </button>
            </div>
            }
            {(userInfo.isLogin()) &&
              <AssetContent></AssetContent>
            }
          </div>
        </div>
        <div className="lg:h-2/6 lg:w-2/6">
          <HomeContentAnimation />
        </div>
      </PageContainer>
    </>
  );
}
