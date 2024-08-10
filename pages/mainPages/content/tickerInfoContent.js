`use strict`

import TickerInfoAnimation from './content-animation/tickerInfoAnimation'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import requestServer from '@/components/requestServer'

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

  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          <p>{tickerCode}</p>
        </h1>
        <div className="main-governing-text">
          <p>{tickerDescRef.current}</p>
        </div>
        <div className="flex space-x-4 border w-full h-full text-align-left mt-10 readonly">
          <pre>{tickerInfoContentRef.current ? tickerInfoContentRef.current : 'Ticker info here.'}</pre>
        </div>
        <div className="flex space-x-4 border w-full h-full text-align-left mt-10 readonly">
          <pre>{tickerNewsContentRef.current ? tickerNewsContentRef.current : 'Ticker news here.'}</pre>
        </div>
      </div>
      <div className="lg:h-2/6 lg:w-2/6">
        {TickerInfoAnimation}
      </div>
    </>
  );
}