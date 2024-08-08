`use strict`

import TickerInfoContentAnimation from './content-animation/TickerInfoContentAnimation'
import { useRouter } from 'next/router'

export default function TickerInfoContent({currentStockTicker}) {
  const router = useRouter()

  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          <p>{currentStockTicker}</p>
        </h1>
        <div className="main-governing-text">
          <p>Ticker Name here</p>
        </div>
        <div className="flex justify-center space-x-4">
          <p>Ticker Info Text hear</p>
        </div>
      </div>
      <div className="lg:h-2/6 lg:w-2/6">
        <p>Ticker Image hear</p>
      </div>
    </>
  );
}