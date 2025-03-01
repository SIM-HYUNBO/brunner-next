"use strict";

import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import DivContainer from "@/components/divContainer";
import BrunnerTable from '@/components/brunnerTable';
export default function AssetContent() {
  const [currentDateTime, setCurrentDateTime] = useState('');

  // 현재 시간을 'YYYY-MM-DDTHH:mm' 형식으로 반환하는 함수
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  useEffect(() => {
    // 컴포넌트 마운트 시 현재 시간으로 초기화
    setCurrentDateTime(getCurrentDateTime());

    // 1초마다다 시간을 갱신하는 인터벌 설정
    const intervalId = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 1000);

    // 컴포넌트 언마운트 시 인터벌 클리어
    return () => clearInterval(intervalId);
  }, []);
 
  const columnHeaders = [
    { Header: 'ID', 
      accessor: 'history_id', 
      type: 'text', 
      hidden: true, 
      input_hidden: true, 
      headerClassName: 'text-center bg-blue-500 text-blue-100 !important'
    },
    { Header: 'Date&Time', 
      accessor: 'create_time', 
      type: 'datetime-local', 
      headerClassName: 'text-center bg-orange-500 text-orange-100 !important', 
      formatter: (value) => moment(value).format("YYYY-MM-DD HH:mm:ss") 
    },
    { Header: 'Amount', 
      accessor: 'amount', 
      type: 'number', 
      headerClassName: 'text-center bg-blue-500 text-blue-100 !important'
    },
    { Header: 'Comment', 
      accessor: 'comment', 
      type: 'text', 
      headerClassName: 'text-center bg-green-500 text-green-100 !important'
    },
  ];

  return (
    <>
      <DivContainer>
      
      <div className="w-full px-1">
        <BrunnerTable columnHeaders={columnHeaders} tableTitle='Asset History' currentDateTime={getCurrentDateTime} />
      </div>

      </DivContainer>
    </>
  );
}