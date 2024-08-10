`use strict`

import HomeContentAnimation from './content-animation/homeContentAnimation'
import { useRouter } from 'next/router'
import * as userInfo from './../../../components/userInfo'

export default function HomeContent() {
  const router = useRouter()

  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          Asset management
        </h1>
        <div className="main-governing-text">
          Effective Management: The Key to Wealth and Stock Market Success
          Achieve Wealth Through Smart Management and Market Engagement
          Unlock Wealth: Manage Well, Stay Engaged, and Use Brunner Safely
          Master Management for Wealth: Stay Engaged in the Stock Market
          Stay in the Market, Communicate, and Get Wealthy with Brunner-Next
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
          </div>}
        </div>
      </div>
      <div className="lg:h-2/6 lg:w-2/6">
        <HomeContentAnimation />
      </div>
    </>
  );
}
