`use strict`

import HomeContentAnimation from './content-animation/homeContentAnimation'
import { useRouter } from 'next/router'
import * as userInfo from '@/components/userInfo'
import DivContainer from '@/components/DivContainer'
import BrunnerVideo from '@/components/brunnerVideo'

export default function HomeContent() {
  const router = useRouter()

  return (
    <>
      <DivContainer className="desktop:flex-col mobile:flex-row ">
        <div className="w-1/2 items-start text-left">
          <h2 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
            Asset management
          </h2>
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
            <div className="mt-10">
              <BrunnerVideo
                url={'https://youtu.be/0j1BdlsL_ew?t=2'}
                title="The powerful effect of S&P500"
              >
              </BrunnerVideo>
            </div>

          </div>
        </div>
        <div className="w-2/6 items-center ml-20">
          <HomeContentAnimation />
        </div>
      </DivContainer >
    </>
  );
}
