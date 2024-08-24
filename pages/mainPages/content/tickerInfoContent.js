`use strict`

import TickerInfoAnimation from './content-animation/tickerInfoAnimation'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import requestServer from '@/components/requestServer'
import Board from '@/pages/mainPages/content/boardContent'
import RealtimeChart from './realtimeChart';

export default function TickerInfoContent({ tickerCode: tickerCode }) {
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [modalContent, setModalContent] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => { },
    onClose: () => { }
  });
  const openModal = (message) => {
    return new Promise((resolve, reject) => {
      setModalContent({
        isOpen: true,
        message: message,
        onConfirm: (result) => { resolve(result); closeModal(); },
        onClose: () => { reject(false); closeModal(); }
      });
    });
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalContent({
      isOpen: false,
      message: '',
      onConfirm: () => { },
      onClose: () => { }
    });
  };


  const router = useRouter()

  const [tickerDesc, setTickerDesc] = useState('');
  const tickerDescRef = useRef(tickerDesc);
  const setTickerDescRef = (newValue) => {
    setTickerDesc(newValue);
    tickerDescRef.current = newValue;
  }

  const [tickerInfoContent, setTickerInfoContent] = useState('');
  const tickerInfoContentRef = useRef(tickerInfoContent);
  const setTickerInfoContentRef = (newValue) => {
    setTickerInfoContent(newValue);
    tickerInfoContentRef.current = newValue;
  }

  const [tickerNewsContent, setTickerNewsContent] = useState('');
  const tickerNewsContentRef = useRef(tickerNewsContent);
  const setTickerNewsContentRef = (newValue) => {
    setTickerNewsContent(newValue);
    tickerNewsContentRef.current = newValue;
  }

  useEffect(() => {
    getTickerInfo();
  }, []);


  const getTickerInfo = async () => {
    try {
      const jRequest = {
        commandName: 'stock.getTickerInfo',
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        tickerCode: tickerCode,
      };

      setLoading(true);
      const jResponse = await requestServer('POST', JSON.stringify(jRequest));

      if (jResponse.error_code === 0) {

        if (jResponse.tickerInfo) {
          setTickerDescRef(jResponse.tickerInfo.tickerDesc);
          setTickerInfoContentRef(jResponse.tickerInfo.tickerInfoContent);
          setTickerNewsContentRef(jResponse.tickerInfo.tickerNewsContent);
        }
      } else {
        openModal(JSON.stringify(jResponse.error_message));
      }
    } catch (err) {
      openModal(err instanceof Error ? err.message : 'Unknown error occurred');
    }
    finally {
      setLoading(false);
    }
  };

  // 현재 가격
  const [currentPrice, setCurrentPrice] = useState();
  const currentPriceRef = useRef(currentPrice);

  const updateCurrentPrice = (newValue) => {
    var textColor = '';

    if (currentPriceRef.current == newValue)
      textColor = 'slate-400';
    else if (currentPriceRef.current > newValue)
      textColor = 'blue-600';
    else
      textColor = 'red-600';

    currentPriceRef.current = newValue;
    setCurrentPrice(newValue);
    setCurrentPriceTextColorRef(textColor);
  };

  // 현재가격 표시 색깔
  const [currentPriceTextColor, setCurrentPriceTextColor] = useState();
  const currentPriceTextColorRef = useRef(currentPriceTextColor);
  const setCurrentPriceTextColorRef = (newValue) => {
    setCurrentPriceTextColor(newValue);
    currentPriceTextColorRef.current = newValue;

  };

  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          {`${tickerCode}`}
        </h1>
        <div className="main-governing-text">
          <h2>{tickerDescRef.current}</h2>
        </div>
        <div className="flex space-x-4 border w-full h-full text-align-left mt-10 readonly">
          <pre>{tickerInfoContentRef.current ? tickerInfoContentRef.current : 'Ticker info here.'}</pre>
        </div>
        <input className={`text-center text-5xl text-${currentPriceTextColorRef.current} bg-slate-50 dark:bg-slate-800 border border-slate-400 mt-10 mb-2 h-100 w-[100%] px-5 py-3`}
          type="text"
          value={currentPriceRef.current}
          placeholder="Current Price ..."
        />
        <button
          className="bg-indigo-500 text-white py-2 px-4 h-10 mb-5"
          type="submit"
          onClick={() => {
            getTickerInfo();
          }}
        >
          Refresh
        </button>
        <RealtimeChart updateCurrentPrice={updateCurrentPrice} ></RealtimeChart>
        <div className="flex space-x-4 border w-full h-full text-align-left mt-10 readonly">
          <p>{tickerNewsContentRef.current ? tickerNewsContentRef.current : 'Ticker news here.'}</p>
        </div>
        <div className="flex space-x-4 border w-full h-full text-align-left mt-10 readonly">
          <Board boardType={tickerCode} />
        </div>

      </div>
      <div className="lg:h-2/6 lg:w-2/6 border w-100 h-100" >
        <TickerInfoAnimation />
      </div>
    </>
  );
}