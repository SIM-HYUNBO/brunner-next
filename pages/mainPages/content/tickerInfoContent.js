`use strict`

import TickerInfoAnimation from './content-animation/tickerInfoAnimation'
import { useState, useRef, useEffect } from 'react'
import requestServer from '@/components/requestServer'
import Board from '@/pages/mainPages/content/boardContent'
import RealtimeChart from './realtimeChart';
import * as Constants from '@/components/constants'

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

  const [tickerDesc, setTickerDesc] = useState('');
  const tickerDescRef = useRef(tickerDesc);
  const setTickerDescRef = (newValue) => {
    setTickerDesc(newValue);
    tickerDescRef.current = newValue;
  }

  // const [tickerInfoContent, setTickerInfoContent] = useState('');
  // const tickerInfoContentRef = useRef(tickerInfoContent);
  // const setTickerInfoContentRef = (newValue) => {
  //   setTickerInfoContent(newValue);
  //   tickerInfoContentRef.current = newValue;
  // }

  const [tickerInfoContent, settickerInfoContent] = useState('');
  const tickerInfoContentRef = useRef(tickerInfoContent);
  const settickerInfoContentRef = (newValue) => {
    settickerInfoContent(newValue);
    tickerInfoContentRef.current = newValue;
  }

  useEffect(() => {
    getTickerInfo();
  }, []);


  const getTickerInfo = async () => {
    try {
      const jRequest = {
        commandName: Constants.COMMAND_STOCK_GET_TICKER_INFO,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        tickerCode: tickerCode,
      };

      setLoading(true);
      const jResponse = await requestServer('POST', JSON.stringify(jRequest));
      setLoading(false);

      if (jResponse.error_code === 0) {

        if (jResponse.tickerInfo) {
          setTickerDescRef(jResponse.tickerInfo.tickerDesc);
          settickerInfoContentRef(convertJsonToPlainText(jResponse.tickerInfo.tickerInfoContent));

          for (let key in jResponse.tickerInfo.tickerInfoContent) {
            const value = jResponse.tickerInfo.tickerInfoContent[key]
            if (key === 'branding') {
              for (let key2 in jResponse.tickerInfo.tickerInfoContent[key]) {
                const value2 = jResponse.tickerInfo.tickerInfoContent[key][key2]
                console.log(key2);
                console.log(value2);
              }
            }
          }
        }
      } else {
        setLoading(false);
        openModal(JSON.stringify(jResponse.error_message));
      }
    } catch (err) {
      setLoading(false);
      openModal(err instanceof Error ? err.message : constants.MESSAGE_UEO);
    }
  };

  function convertJsonToPlainText(jsonObject) {
    return Object.entries(jsonObject)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // 객체 값을 문자열로 변환하고 콤마와 따옴표를 제거
          const formattedObject = JSON.stringify(value, null, 2)
            .replace(/"([^"]+)":/g, '$1:') // 키의 따옴표 제거
            .replace(/"([^"]+)"/g, '$1')   // 값의 따옴표 제거
            .replace(/,\s*([\]}])/g, '$1') // 마지막 콤마 제거
            .replace(/^\{\n/, '')          // 시작 중괄호 및 줄바꿈 제거
            .replace(/\n\}$/, '');         // 마지막 중괄호 및 줄바꿈 제거
          return `${key}: \n${formattedObject}`;
        }
        return `${key}: ${value}`;
      })
      .join('\n'); // 항목 간에 줄바꿈을 두 번 추가하여 구분
  }

  // 현재 가격
  const [currentPrice, setCurrentPrice] = useState();
  const currentPriceRef = useRef(currentPrice);

  const updateCurrentPrice = (firstData, lastData, newData) => {
    var textColor = '';

    if (firstData?.y == newData?.y)
      textColor = 'text-gray-500';
    else if (firstData?.y > newData?.y)
      textColor = 'text-blue-500';
    else
      textColor = 'text-red-500';

    currentPriceRef.current = newData?.y;
    setCurrentPrice(newData?.y);
    setCurrentPriceTextColorRef(textColor);
  };

  // 현재가격 표시 색깔
  const currentPriceTextColorRef = useRef(null);
  const setCurrentPriceTextColorRef = (newValue) => {
    currentPriceTextColorRef.current.classList.remove('text-gray-500');
    currentPriceTextColorRef.current.classList.remove('text-red-500');
    currentPriceTextColorRef.current.classList.remove('text-blue-500');

    currentPriceTextColorRef.current.classList.add(newValue);

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
        <input ref={currentPriceTextColorRef} className={`text-center text-5xl text-gray bg-slate-50 dark:bg-slate-800 border border-slate-400 mt-10 mb-2 h-100 w-[100%] px-5 py-3`}
          type="text"
          value={currentPriceRef.current ? `${currentPriceRef.current}` : ``}
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
        <div className="flex space-x-4 border w-full h-full text-align-left mt-5 readonly">
          <pre>{tickerInfoContentRef.current ? tickerInfoContentRef.current : 'Ticker news here.'}</pre>
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