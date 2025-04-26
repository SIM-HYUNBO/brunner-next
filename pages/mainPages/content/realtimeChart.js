`use strict`;

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import RequestServer from "@/components/requestServer";
import { useModal } from "@/components/brunnerMessageBox";
import * as constants from "@/components/constants";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

const RealtimeChart = ({ updateCurrentPrice }) => {

  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();

  const [currentTicker, setCurrentTicker] = useState(process.currentTicker);
  const currentTickerRef = useRef(currentTicker);
  const [series, setSeries] = useState([
    {
      name: `${currentTicker}`,
      data: [],
    },
  ]);
  const seriesRef = useRef(series);
  const setSeriesRef = (newVal) => {
    seriesRef.current - newVal;
    setSeries(newVal);
  };

  const [intervalTime, setIntervalTime] = useState(10000); // 인터벌 시간 상태 (밀리초)
  const intervalTimeRef = useRef(intervalTime);
  const setIntervalTimeRef = (newVal) => {
    setIntervalTime(newVal);
    intervalTimeRef.current = newVal;
  };

  /* 차트 색깔 결정 
        처음값 대비 올랐으면 빨간색
        내렸으면 파란색
        같으면 회색
    */
  function setChartColor(newSeries) {
    var color = "gray";
    var colorName = "gray";

    var firstValue = null;
    var lastValue = null;

    if (newSeries[0].data.length >= 2) {
      firstValue = newSeries[0].data[0].y;
      lastValue = newSeries[0].data[newSeries[0].data.length - 1].y;

      if (firstValue < lastValue) {
        color = `red`; // red
        colorName = "red";
        setOptions(getChartOptions("red"));
      } else if (firstValue > lastValue) {
        color = `blue`; // blue
        colorName = "blue";
        setOptions(getChartOptions("blue"));
      } else setOptions(getChartOptions("gray"));
    } else setOptions(getChartOptions("gray"));
  }

  const formatter = new Intl.DateTimeFormat([], {
    // year: 'numeric',
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    // second: '2-digit',
    timeZoneName: "short",
    hourCycle: "h23",
  });

  const getChartOptions = (chartColor) => {
    return {
      chart: {
        id: "realtime-chart",
        animations: {
          enabled: true,
          easing: "linear",
          dynamicAnimation: {
            speed: 500, // 애니메이션 속도 조절
          },
        },
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false,
          formatter: function (value) {
            // Date 객체를 사용하여 포맷팅
            const date = new Date(value);
            return formatter.format(date);
          },
          style: {
            colors: "#9e9e9e", // x축 레이블 색상
            //fontSize: '12px',  // x축 레이블 폰트 크기
            fontFamily: "Arial, sans-serif", // x축 레이블 폰트 패밀리
          },
        },
        style: {
          colors: "#94a3b8", // slate-400 색상 설정
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => value.toFixed(2),
          style: {
            colors: "#9e9e9e", // x축 레이블 색상
            //fontSize: '12px',  // x축 레이블 폰트 크기
            fontFamily: "Arial, sans-serif", // x축 레이블 폰트 패밀리
          },
        },
        style: {
          colors: "#94a3b8", // slate-400 색상 설정
        },
      },
      stroke: {
        curve: "smooth",
        width: 1,
        colors: [
          chartColor == "gray"
            ? "#808080"
            : chartColor == "red"
              ? "#FF0000"
              : chartColor == "blue"
                ? "#0000FF"
                : "#808080",
        ],
      },
      title: {
        text: `${currentTickerRef.current} Realtime`,
        align: "left",
        style: {
          color: "#94a3b8", // slate-400 색상 설정
        },
      },
      markers: {
        size: 2, // 점 크기
        colors: [
          chartColor == "gray"
            ? "#808080"
            : chartColor == "red"
              ? "#FF0000"
              : chartColor == "blue"
                ? "#0000FF"
                : "#808080",
        ], // 점 색상
        strokeColors: [
          chartColor == "gray"
            ? "#808080"
            : chartColor == "red"
              ? "#FF0000"
              : chartColor == "blue"
                ? "#0000FF"
                : "#808080",
        ], // 점 테두리 색상
        strokeWidth: 1, // 점 테두리 두께
      },
      colors: [
        chartColor == "gray"
          ? "#808080"
          : chartColor == "red"
            ? "#FF0000"
            : chartColor == "blue"
              ? "#0000FF"
              : "#808080",
      ],
      tooltip: {
        enabled: true,
        // theme: isDarkMode 'dark', // dark, light, custom
        style: {
          fontSize: "12px",
          fontFamily: "Arial",
          colors: [
            chartColor == "gray"
              ? "#808080"
              : chartColor == "red"
                ? "#FF0000"
                : chartColor == "blue"
                  ? "#0000FF"
                  : "#808080",
          ], // 텍스트 색상
        },
        onDatasetHover: {
          highlightDataSeries: true,
        },
        fillSeriesColor: false, // 시리즈의 색상을 툴팁 배경에 적용할지 여부
        marker: {
          show: true, // 마커 표시 여부
        },
        x: {
          show: true, // x축 값을 툴팁에 표시할지 여부
          format: "yy MMM dd HH:mm", // 포맷 설정
          formatter: function (value) {
            // Date 객체를 사용하여 포맷팅
            const date = new Date(value);
            return formatter.format(date);
          },
        },
        y: {
          formatter: function (value) {
            return "$" + value.toFixed(2); // 값에 포맷 적용
          },
        },
        z: {
          title: "Size: ", // 버블 차트에서 z값에 대한 제목 설정
          formatter: function (value) {
            return value + " cm"; // z값 포맷
          },
        },
        fixed: {
          enabled: false,
          position: "topLeft", // topLeft, topRight, bottomLeft, bottomRight
          offsetX: 0,
          offsetY: 0,
        },
      },
    };
  };

  const [options, setOptions] = useState(getChartOptions("gray"));

  var lastChartData = null;
  var firstChartData = null;

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  var prevTickerCode = null;

  const getRealtimeStockInfo = async () => {
    try {
      if (currentTickerRef.current !== process.currentTicker) {
        setCurrentTicker(process.currentTicker);
        currentTickerRef.current = process.currentTicker;
      }

      if (!currentTickerRef.current) return;

      while (true) {
        if (!currentTickerRef.current || isUnmounted)
          // 종목이 없거나 종목 선택이 바뀐경우 종료 처리 필요
          break;

        prevTickerCode = currentTickerRef.current;

        const jRequest = {
          commandName: constants.commands.COMMAND_STOCK_INFO_GET_REALTIME_STOCK_INFO,
          systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
          tickerCode: currentTickerRef.current,
        };

        const jResponse = await RequestServer("POST", JSON.stringify(jRequest));

        if (jResponse.error_code === 0) {
          if (jResponse.stockInfo.data.t > lastChartData?.t)
            /*차트에 있는 마지막데이터의 시간값과 비교*/
            handleNewData(jResponse.stockInfo.data);
          else; // 과거 데이터는 낮시간에 발생 하므로 표시하지 않음
        } else {
          if (jResponse.error_code === 429) {
            // Too Many Request error 처리
            setIntervalTimeRef(intervalTimeRef.current + 1000);
            console.log(
              JSON.stringify(
                `${jResponse.error_message} Refresh inteval will be increased to ${intervalTimeRef.current} ms`
              )
            );
          }
        }

        await delay(intervalTime);
      }
    } catch (err) {
      openModal(
        err instanceof Error ? err.message : constants.messages.MESSAGE_UNKNOWN_ERROR
      );
    }
  };

  const getLatestStockInfo = async () => {
    try {
      /* 최근 데이터 100개 요청 */
      const jRequest = {
        commandName: constants.commands.COMMAND_STOCK_INFO_GET_LATEST_STOCK_INFO,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        tickerCode: currentTickerRef.current,
        dataCount: -100,
      };

      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));

      if (jResponse.error_code === 0) {
        handleNewData(jResponse.stockInfo);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (err) {
      openModal(err);
    } finally {
      await getRealtimeStockInfo(); // 처음에 실행하고 타이머 반복
    }
  };

  const handleNewData = (newData) => {
    if (Array.isArray(newData)) {
      for (let i = 0; i < newData.length; i++) {
        if (i == 0) firstChartData = newData[i];

        handleSingleData(newData[i]);
        lastChartData = newData[i];
      }
    } else {
      handleSingleData(newData);
      lastChartData = newData;
    }
  };

  const handleSingleData = (newValue) => {
    const now = new Date().getTime();
    const givenTime = new Date(newValue.t * 1000).getTime();

    const diff = now - givenTime;

    const firstData = firstChartData
      ? {
        x: new Date(firstChartData?.t * 1000).getTime(),
        y: firstChartData?.c,
      }
      : {
        x: null,
        y: null,
      };

    const lastData = lastChartData
      ? {
        x: new Date(lastChartData?.t * 1000).getTime(),
        y: lastChartData?.c,
      }
      : {
        x: null,
        y: null,
      };

    const newData = newValue
      ? {
        x: new Date(newValue?.t * 1000).getTime(),
        y: newValue?.c,
      }
      : {
        x: null,
        y: null,
      };

    if (lastChartData?.c != newValue?.c)
      updateCurrentPrice(firstData, lastData, newData);

    setSeriesRef((prevSeries) => {
      const existingData = prevSeries[0].data;
      const updatedData = [...existingData, newData].slice(-5040); // 인터벌이 5초라고 했을떄 하루 7시간치
      const newSeries = [
        {
          ...prevSeries[0],
          data: updatedData,
        },
      ];

      setChartColor(newSeries);

      return newSeries;
    });
  };

  var isUnmounted = false;

  useEffect(() => {
    getLatestStockInfo();

    // 컴포넌트 언마운트
    return () => {
      isUnmounted = true;
    };
  }, []);

  return (
    <div className={`w-full mt-5`}>
      <BrunnerMessageBox />
      {loading && (
        <div className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50`}>
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900`}></div>
        </div>
      )}      
      <ApexCharts
        options={options}
        series={series}
        type="line"
        height={350}
        width={"100%"}
      />
    </div>
  );
};

export default RealtimeChart;
