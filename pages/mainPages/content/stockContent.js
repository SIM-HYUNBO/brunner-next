`use strict`;

import dotenv from "dotenv";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import moment from "moment";
import dynamic from "next/dynamic";
import DivContainer from "@/components/divContainer";
import RequestServer from "@/components/requestServer";
import { useModal } from "@/components/brunnerMessageBox";
import * as constants from "@/components/constants";
import * as UserInfo from "@/components/userInfo";
import RealtimeChart from "./realtimeChart";
import AssetContent from "./assetContent";

const StockContent = () => {
  const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();

  useEffect(() => {
    setThemeRef(themeRef.current);

    const storedSearches = localStorage.getItem("recentSearches");
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }

    const defaultTicker = localStorage.getItem("defaultTicker");
    if (defaultTicker) {
      // setDefaultTicker(defaultTicker);
      setCurrentTickerRef(defaultTicker);
      handleStockRequest();
    }

    displayInitialTickerList();

    if (!currencyListRef.current || currencyListRef.current.length === 0) {
      getCurrencyList();
      setSelectedCurrencyRef({ 'currency_code': 'USD' })
      setSelectedExchangeRef(1)
    }
  }, []);

  const router = useRouter();

  // theme : 현재값 가져오기 getter
  // setTheme : 현재값 바꾸기 setter
  const { theme, setTheme } = useTheme();
  const themeRef = useRef(theme);
  const setThemeRef = (newValue) => {
    themeRef.current = newValue;
    setTheme(newValue);
  };
  const isDarkMode = () => {
    return themeRef.current === "dark";
  };

  // 현재 선택한 주식 심볼
  const [currentTicker, setCurrentTicker] = useState("");
  const currentTickerRef = useRef(currentTicker);
  const setCurrentTickerRef = (newVal) => {
    setCurrentTicker(newVal);
    currentTickerRef.current = newVal;
    process.currentTicker = newVal;
    // updateCurrentPrice(null, null, null);
  };

  // 현재 선택한 주식 종목의 데이터
  const [currentTickerStockData, setCurrentTickerStockData] = useState(null);
  const currentTickerStockDataRef = useRef(currentTickerStockData);
  const setCurrentTickerStockDataRef = (newVal) => {
    setCurrentTickerStockData(newVal);
    currentTickerStockDataRef.current = newVal;
  };

  // 차트 데이터 간격의 시간 단위
  const [dataIntervalUnit, setDataIntervalUnit] = useState("week");
  const dataIntervalUnitRef = useRef(dataIntervalUnit);
  const setDataIntervalUnitRef = (newVal) => {
    setDataIntervalUnit(newVal);
    dataIntervalUnitRef.current = newVal;
  };

  // 기간
  const [periodValue, setPeriodValue] = useState(1);

  // 기간의 시간 단위
  const [periodUnit, setPeriodUnit] = useState("years");
  const periodUnitRef = useRef(periodUnit);
  const setPeriodUnitRef = (newVal) => {
    setPeriodUnit(newVal);
    periodUnitRef.current = newVal;
  };

  // 최근 검색한 기록
  // localStorage에 저장했다가 콤보박스에 표시
  const [recentSearches, setRecentSearches] = useState([]);

  // 주식 종목 목록에서 현재 선택한 종목
  const [selectedTicker, setSelectedTicker] = useState(null); // 선택된 옵션

  // 현재 가격
  const [currentPrice, setCurrentPrice] = useState();
  const currentPriceRef = useRef(currentPrice);
  const setCurrentPriceRef = (newValue) => {
    currentPriceRef.current = newValue;
    setCurrentPrice(newValue);
  }

  const updateCurrentPrice = (firstData, lastData, newData) => {
    var textColor = "";

    if (firstData?.y == newData?.y) textColor = "text-gray-500";
    else if (firstData?.y > newData?.y) textColor = "text-blue-500";
    else textColor = "text-red-500";

    if (currentPriceRef.current != newData.y) {
      currentPriceRef.current = newData.y;
      setCurrentPriceRef(newData.y);
      setCurrentPriceTextColorRef(textColor);
    }
  };

  // 현재가격 표시 색깔
  const currentPriceTextColorRef = useRef(null);
  const setCurrentPriceTextColorRef = (newValue) => {
    currentPriceTextColorRef.current.classList.remove("text-gray-500");
    currentPriceTextColorRef.current.classList.remove("text-red-500");
    currentPriceTextColorRef.current.classList.remove("text-blue-500");

    currentPriceTextColorRef.current.classList.add(newValue);
  };

  // 환율 목록
  const [currencyList, setCurrencyList] = useState([]);
  const currencyListRef = useRef(currencyList);
  const setCurrencyListRef = (newValue) => {
    setCurrencyList(newValue);
    currencyListRef.current = newValue;
  };

  // 선택한 통화
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const selectedCurrencyRef = useRef(selectedCurrency);
  const setSelectedCurrencyRef = (newValue) => {
    setSelectedCurrency(newValue);

    selectedCurrencyRef.current = newValue;
  };

  const selectedCurrencyChanged = (event) => {
    setSelectedCurrencyRef({ 'currency_code': event.target.value }); // 선택된 값을 상태에 저장
    setExchangeByCurrency();
  }

  // 선택한 통화의 환율
  const [selectedExchange, setSelectedExchange] = useState(1);
  const selectedExchangeRef = useRef(selectedExchange);
  const setSelectedExchangeRef = (newValue) => {
    setSelectedExchange(newValue);

    selectedExchangeRef.current = newValue;
  };

  // 모든 종목 목록
  const [tickerList, setTickerList] = useState([]);
  const tickerListRef = useRef(tickerList);
  const setTickerListRef = (newValue) => {
    setTickerList(newValue);

    const currentTickerList = newValue?.map((ticker) => ({
      value: ticker.ticker_code, // ticker_code 사용
      label: `${ticker.ticker_code} - ${ticker.ticker_desc}`, // ticker_desc 사용
    }));

    tickerListRef.current = currentTickerList;
    process.tickerList = newValue;
  };

  // 리스트 항목들을 참조할 ref 추가
  const tickerListDOMRef = useRef(null);

  // 특정 티커로 스크롤 이동하는 함수
  const scrollToTicker = (ticker) => {
    const stockItems = tickerListDOMRef.current.querySelectorAll("li");

    let index = -1;

    stockItems.forEach((item, index) => {
      if (
        item.textContent.slice(0, item.textContent.indexOf(" -")) === ticker
      ) {
        index = index;
        item.classList.add("selected"); // 선택 표시를 위해 클래스 추가
        item.scrollIntoView({ behavior: "smooth", block: "center" }); // 해당 항목으로 스크롤 이동
        setSelectedTicker({ key: ticker, value: ticker });
        return;
      } else {
        item.classList.remove("selected"); // 다른 항목에서 선택 표시 제거
      }
    });

    if (index !== -1 && tickerListDOMRef.current) {
      const listItem = tickerListDOMRef.current.children[index];
      listItem.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // 최근 검색 콤보박스에서 종목을 선택했을 때 처리
  const handleRecentSearchClick = (ticker) => {
    getStockInfo(ticker);

    // 선택한 티커가 목록에 있는지 확인하고 스크롤 이동
    scrollToTicker(ticker);
  };

  // useEffect 내에서 동기호출을 해야하므로 함수 분리
  const displayInitialTickerList = async () => {
    // 컴포넌트가 마운트될 때 티커 목록 가져오기
    setTickerListRef(process.tickerList);

    if (!tickerListRef.current) {
      await getTickerList();
    }
  };

  // 모든 종목 목록을 서버에서 조회
  const getTickerList = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.COMMAND_STOCK_INFO_GET_TICKER_LIST,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      };

      // setLoading(true);// 데이터 로딩 시작
      setCurrentTickerStockDataRef(null);
      const jResponse = await RequestServer("POST", jRequest);
      // setLoading(false);// 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        await setTickerListRef(jResponse.tickerList);
      } else {
        console.log(
          `${constants.commands.COMMAND_STOCK_INFO_GET_TICKER_LIST}:${JSON.stringify(
            jResponse.error_message
          )}`
        );
        openModal(jResponse.error_message);
      }
    } catch (err) {
      setLoading(false);
      openModal(
        `${constants.commands.COMMAND_STOCK_INFO_GET_TICKER_LIST}:${err instanceof Error ? err.message : constants.messages.MESSAGE_UNKNOWN_ERROR
        }`
      );
    }
  };

  // 주식 데이터 요청 처리
  const handleStockRequest = (event) => {
    if (event) event.preventDefault();

    if (!currentTickerRef.current) {
      openModal(constants.messages.MESSAGE_INPUT_STOCK_SYMBOL);
      return;
    }

    getStockInfo();
  };

  const viewDetailInfo = (event) => {
    // 기본 링크 동작 방지
    event.preventDefault();

    if (!currentTickerRef.current) {
      openModal(constants.messages.MESSAGE_INPUT_STOCK_SYMBOL);
      return;
    }

    router.push(`/mainPages/tickerInfo?tickerCode=${currentTickerRef.current}`); // 원하는 경로로 이동
  };

  // 선택한 종목의 주식 데이터를 서버에서 조회
  const getStockInfo = async () => {
    try {
      const timefrom = moment()
        .subtract(periodValue, periodUnitRef.current)
        .format("YYYY-MM-DD");
      const timeto = moment().format("YYYY-MM-DD");

      const jRequest = {
        commandName: constants.commands.COMMAND_STOCK_INFO_GET_STOCK_INFO,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        tickerCode: currentTickerRef.current,
        multiplier: 1,
        timespan: dataIntervalUnitRef.current,
        from: timefrom,
        to: timeto,
        adjust: true,
        sort: "desc",
        limit: "",
      };

      setCurrentTickerStockDataRef(null);

      setLoading(true);// 데이터 로딩 시작
      const jResponse = await RequestServer("POST", jRequest);
      setLoading(false);// 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        setCurrentTickerStockDataRef(jResponse.stockInfo);

        // 최근 검색 기록 업데이트 (정상 조회된 종목만)
        if (jResponse.stockInfo) {
          const newSearch = {
            value: currentTickerRef.current,
            label: currentTickerRef.current,
          };
          const updatedSearches = [
            newSearch,
            ...recentSearches.filter(
              (s) => s.value !== currentTickerRef.current
            ),
          ].slice(0, 10); // 최대 10개까지 저장
          setRecentSearches(updatedSearches);
          localStorage.setItem(
            "recentSearches",
            JSON.stringify(updatedSearches)
          );
        }
      } else {
        setLoading(false);
        console.log(
          `${constants.commands.COMMAND_STOCK_INFO_GET_STOCK_INFO}: ${JSON.stringify(
            jResponse.error_message
          )}`
        );
        openModal(jResponse.error_message);
      }
    } catch (err) {
      setLoading(false);
      openModal(
        `${constants.commands.COMMAND_STOCK_INFO_GET_STOCK_INFO}:${err instanceof Error ? err.message : constants.messages.MESSAGE_UNKNOWN_ERROR
        }`
      );
    }
  };

  // 지표 계산 함수들
  const calculateSMA = (data, period = 14) => {
    const sma = [];
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      sum += data[i].y;
      if (i >= period - 1) {
        sma.push({ x: data[i].x, y: sum / period });
        sum -= data[i - period + 1].y;
      }
    }

    return sma;
  };

  const calculateEMA = (data, period = 14) => {
    const ema = [];
    const k = 2 / (period + 1);
    let emaPrev = data[0].y; // 첫 번째 EMA 값은 첫 번째 가격

    ema.push({ x: data[0].x, y: emaPrev });

    for (let i = 1; i < data.length; i++) {
      const emaCurrent = data[i].y * k + emaPrev * (1 - k);
      ema.push({ x: data[i].x, y: emaCurrent });
      emaPrev = emaCurrent;
    }

    return ema;
  };

  const calculateRSI = (data, period = 14) => {
    const rsi = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < data.length; i++) {
      const change = data[i].y - data[i - 1].y;
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }

      if (i >= period) {
        const averageGain = gains / period;
        const averageLoss = losses / period;
        const rs = averageGain / averageLoss;
        const rsiValue = 100 - 100 / (1 + rs);
        rsi.push({ x: data[i].x, y: rsiValue });

        const prevChange = data[i - period + 1].y - data[i - period].y;
        if (prevChange > 0) {
          gains -= prevChange;
        } else {
          losses += prevChange;
        }
      }
    }

    return rsi;
  };

  const calculateMACD = (
    data,
    shortPeriod = 12,
    longPeriod = 26,
    signalPeriod = 9
  ) => {
    const shortEMA = calculateEMA(data, shortPeriod);
    const longEMA = calculateEMA(data, longPeriod);
    const macd = [];

    // MACD 라인 계산
    for (let i = 0; i < data.length; i++) {
      if (i >= longPeriod - 1 && shortEMA[i] && longEMA[i]) {
        // shortEMA[i]와 longEMA[i] 체크
        const macdValue = shortEMA[i].y - longEMA[i].y;
        macd.push({ x: data[i].x, y: macdValue });
      } else {
        macd.push({ x: data[i].x, y: 0 });
      }
    }

    // 시그널 라인 계산
    const signalLine = calculateEMA(macd, signalPeriod);

    // 히스토그램 계산
    const histogram = macd.map((m, index) => {
      if (signalLine[index]) {
        // 시그널 라인 존재 여부 체크
        return { x: m.x, y: m.y - signalLine[index].y };
      } else {
        return { x: m.x, y: 0 };
      }
    });

    return { macd, signalLine, histogram };
  };

  const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
    const sma = calculateSMA(data, period);
    const bollingerBands = data.map((d, index) => {
      if (index >= period - 1) {
        const window = data.slice(index - period + 1, index + 1);
        const squaredDiffs = window.map((w) =>
          Math.pow(w.y - sma[index - period + 1].y, 2)
        );
        const variance =
          squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
        const stdDev = Math.sqrt(variance);
        const middleBand = sma[index - period + 1].y;
        const upperBand = middleBand + multiplier * stdDev;
        const lowerBand = middleBand - multiplier * stdDev;

        return {
          x: d.x,
          upperBand,
          middleBand,
          lowerBand,
        };
      } else {
        return { x: d.x, upperBand: null, middleBand: null, lowerBand: null };
      }
    });

    return bollingerBands;
  };

  // 티커 선택 시 처리
  const handleTickerChange = (selectedOption) => {
    setSelectedTicker(selectedOption);
    setCurrentTickerRef(selectedOption ? selectedOption.value : "");
    handleStockRequest();
  };

  // 차트 렌더링을 위한 준비
  const renderChart = () => {
    if (!currentTickerStockDataRef.current) return null;

    const priceData = currentTickerStockDataRef.current.map((d) => ({
      x: new Date(d.t).getTime(),
      y: d.c,
    }));

    const sma = calculateSMA(priceData);
    const ema = calculateEMA(priceData);
    const rsi = calculateRSI(priceData);
    const macdData = calculateMACD(priceData);
    const bollingerBands = calculateBollingerBands(priceData);

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

    const chartOptions = {
      chart: {
        type: "line",
        height: 350,
        zoom: {
          enabled: true,
        },
      },
      stroke: {
        width: [1, 1, 1], // 각 선의 두께 설정
        curve: "smooth", // 부드러운 곡선
      },
      title: {
        text: `${currentTickerRef.current} History`,
        align: "left",
        style: {
          color: "#94a3b8", // slate-400 색상 설정
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          style: {
            colors: "#94a3b8",
          },
          formatter: function (value) {
            // Date 객체를 사용하여 포맷팅
            const date = new Date(value * 1000);
            return formatter.format(date);
          },
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val;
          },
          style: {
            colors: "#94a3b8", // slate-400 색상 설정
          },
        },
      },
      series: [
        {
          name: "Price",
          data: priceData,
        },
        {
          name: "SMA",
          data: sma,
        },
        {
          name: "EMA",
          data: ema,
        },
      ],
      legend: {
        labels: {
          colors: ["#94a3b8", "#94a3b8", "#94a3b8"],
        },
      },
    };

    const rsiOptions = {
      chart: {
        type: "line",
        height: 150,
        zoom: {
          enabled: false,
        },
      },
      stroke: {
        width: [1], // 각 선의 두께 설정
        curve: "smooth", // 부드러운 곡선
      },
      title: {
        text: `${currentTickerRef.current} RSI`,
        align: "left",
        style: {
          color: "#94a3b8", // slate-400 색상 설정
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false, // UTC가 아닌 로컬 시간대로 표시합니다.
          formatter: function (value) {
            // Date 객체를 사용하여 포맷팅
            const date = new Date(value * 1000);
            return formatter.format(date);
          },
          style: {
            colors: "#9e9e9e", // x축 레이블 색상
            //fontSize: '12px',  // x축 레이블 폰트 크기
            fontFamily: "Arial, sans-serif", // x축 레이블 폰트 패밀리
          },
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val;
          },
          style: {
            colors: "#94a3b8", // slate-400 색상 설정
          },
        },
      },
      series: [
        {
          name: "RSI",
          data: rsi,
        },
      ],
      legend: {
        labels: {
          colors: ["#94a3b8"],
        },
      },
    };

    const macdOptions = {
      chart: {
        type: "line",
        height: 150,
        zoom: {
          enabled: false,
        },
      },
      stroke: {
        width: [1, 1, 1], // 각 선의 두께 설정
        curve: "smooth", // 부드러운 곡선
      },
      title: {
        text: `${currentTickerRef.current} MACD`,
        align: "left",
        style: {
          color: "#94a3b8", // slate-400 색상 설정
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          datetimeUTC: false, // UTC가 아닌 로컬 시간대로 표시합니다.
          formatter: function (value) {
            // Date 객체를 사용하여 포맷팅
            const date = new Date(value * 1000);
            return formatter.format(date);
          },
          style: {
            colors: "#9e9e9e", // x축 레이블 색상
            //fontSize: '12px',  // x축 레이블 폰트 크기
            fontFamily: "Arial, sans-serif", // x축 레이블 폰트 패밀리
          },
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val;
          },
          style: {
            colors: "#94a3b8", // slate-400 색상 설정
          },
        },
      },
      series: [
        {
          name: "MACD",
          data: macdData.macd,
        },
        {
          name: "Signal Line",
          data: macdData.signalLine,
        },
        {
          name: "Histogram",
          type: "bar",
          data: macdData.histogram,
        },
      ],
      legend: {
        labels: {
          colors: ["#94a3b8", "#94a3b8", "#94a3b8"],
        },
      },
    };

    const bollingerOptions = {
      chart: {
        type: "line",
        height: 350,
        zoom: {
          enabled: true,
        },
      },
      stroke: {
        width: [1, 1, 1, 1], // 각 선의 두께 설정
        curve: "smooth", // 부드러운 곡선
      },
      title: {
        text: `${currentTickerRef.current} Bollinger Bands`,
        align: "left",
        style: {
          color: "#94a3b8", // slate-400 색상 설정
        },
      },
      xaxis: {
        type: "datetime",
        title: {
          style: {
            color: "#94a3b8", // slate-400 색상 설정
          },
        },
        labels: {
          datetimeUTC: false, // UTC가 아닌 로컬 시간대로 표시합니다.
          formatter: function (value) {
            // Date 객체를 사용하여 포맷팅
            const date = new Date(value * 1000);
            return formatter.format(date);
          },
          style: {
            colors: "#9e9e9e", // x축 레이블 색상
            //fontSize: '12px',  // x축 레이블 폰트 크기
            fontFamily: "Arial, sans-serif", // x축 레이블 폰트 패밀리
          },
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val;
          },
          style: {
            colors: "#94a3b8", // slate-400 색상 설정
          },
        },
        title: {
          style: {
            color: "#94a3b8", // slate-400 색상 설정
          },
        },
      },
      series: [
        {
          name: "Price",
          data: priceData,
        },
        {
          name: "Upper Band",
          data: bollingerBands.map((b) => ({ x: b.x, y: b.upperBand })),
        },
        {
          name: "Middle Band",
          data: bollingerBands.map((b) => ({ x: b.x, y: b.middleBand })),
        },
        {
          name: "Lower Band",
          data: bollingerBands.map((b) => ({ x: b.x, y: b.lowerBand })),
        },
      ],
      legend: {
        labels: {
          colors: ["#94a3b8", "#94a3b8", "#94a3b8", "#94a3b8"],
        },
      },
    };

    const getFirstPrice = () => {
      return currentTickerStockDataRef.current ?
        currentTickerStockDataRef.current[currentTickerStockDataRef.current.length - 1].c :
        currentPriceRef.current
    }

    const getPriceColor = () => {
      const f = getFirstPrice();
      const c = currentPriceRef.current;
      const clr = f > c ? "blue" : f < c ? "red" : "black";
      console.log(`f:${f},c:${c}, color:${clr}`);

      return clr;
    }

    return (
      <div className={`flex flex-col mt-5 w-full`}>
        <RealtimeChart updateCurrentPrice={updateCurrentPrice}></RealtimeChart>

        <h2>[{currentTickerRef.current}] in the past {periodValue} {periodUnitRef.current} {Math.abs(currentPriceRef.current - getFirstPrice())}USD {currentPriceRef.current - getFirstPrice() >= 0 ? 'up' : 'down'}</h2>
        <div className={`w-full flex`}>
          <input
            className={`text-${getPriceColor()} text-center bg-slate-50 dark:bg-slate-800 border border-slate-400 h-10 w-full`}
            type="text"
            value={getFirstPrice()}
            placeholder="First Price of the Period"
            style={{ color: getPriceColor() }}
            readOnly
          />
          <p>     ~     </p>
          <input
            className={`text-${getPriceColor()} text-center bg-slate-50 dark:bg-slate-800 border border-slate-400 h-10 w-full`}
            type="text"
            value={currentPriceRef.current}
            placeholder="Last Price of the Period"
            style={{ color: getPriceColor() }}
            readOnly
          />
        </div>

        <ApexCharts className={`mt-5`}
          options={chartOptions}
          series={chartOptions.series}
          type="line"
          height={350}
          width={"100%"}
        />
        <ApexCharts
          options={rsiOptions}
          series={rsiOptions.series}
          type="line"
          height={350}
          width={"100%"}
        />
        <ApexCharts
          options={macdOptions}
          series={macdOptions.series}
          type="line"
          height={350}
          width={"100%"}
        />
        <ApexCharts
          options={bollingerOptions}
          series={bollingerOptions.series}
          type="line"
          height={350}
          width={"100%"}
        />
      </div>
    );
  };

  const getCurrencyList = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.COMMAND_STOCK_INFO_GET_CURRENCY_LIST,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      };

      const jResponse = await RequestServer("POST", jRequest);
      if (jResponse.error_code === 0) {
        setCurrencyListRef(jResponse.currencyList);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (err) {
      openModal(
        `${constants.commands.COMMAND_STOCK_INFO_GET_CURRENCY_LIST}:${err instanceof Error ? err.message : constants.messages.MESSAGE_UNKNOWN_ERROR
        }`
      );
    }
  }

  const setExchangeByCurrency = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.COMMAND_STOCK_INFO_GET_EXCHANGE_BY_CURRENCY,
        currencyCode: selectedCurrencyRef.current.currency_code
      };

      const jResponse = await RequestServer("POST", jRequest);
      if (jResponse.error_code === 0) {
        if (jResponse.exchangeRate.hasOwnProperty(selectedCurrencyRef.current.currency_code) == true) {
          const exchangeRate = jResponse.exchangeRate[selectedCurrencyRef.current.currency_code] / jResponse.exchangeRate['USD']
          setSelectedExchangeRef(exchangeRate);
        } else {
          openModal(jResponse.error_message);
        }
      }
      else {
        openModal(jResponse.error_message);
      }
    } catch (err) {
      openModal(
        `${constants.commands.COMMAND_STOCK_INFO_GET_CURRENCY_LIST}:${err instanceof Error ? err.message : constants.messages.MESSAGE_UNKNOWN_ERROR
        }`
      );
    }
  }

  const SearchPanel = () => {
    return (
      <div className={`flex:col`}>
        <h2 className={`title-font sm:text-4xl text-3xl w-full my-10 font-medium text-green-900`}>
          Stock search
        </h2>
        {/* Span */}
        <div className={`items-start mt-2 dark:text-slate-400 w-full`}>
          <label>Span</label>
          <select
            key={dataIntervalUnitRef.current}
            className={`dark:text-slate-400 ml-2 bg-slate-50 dark:bg-slate-800`}
            value={dataIntervalUnitRef.current}
            onChange={(e) => setDataIntervalUnitRef(e.target.value)}
          >
            <option key="minutes" value="minute">minute</option>
            <option key="hour" value="hour">hour</option>
            <option key="day" value="day">day</option>
            <option key="week" value="week">week</option>
            <option key="month" value="month">month</option>
            <option key="year" value="year">year</option>
          </select>
        </div>
        {/* Period */}
        <div className={`items-start mt-2 dark:text-slate-400`}>
          <label className={`dark:text-slate-400 dark:bg-slate-800`}>
            Period
            <input
              className={`dark:text-slate-400 ml-2 text-center bg-slate-50 dark:bg-slate-800`}
              type="number"
              value={periodValue}
              onChange={(e) => setPeriodValue(e.target.value)}
              min="1"
            />
          </label>
          <select
            className={`ml-2 text-center dark:text-slate-400 bg-slate-50 dark:bg-slate-800`}
            value={periodUnitRef.current}
            onChange={(e) => setPeriodUnitRef(e.target.value)}
          >
            <option key="minutes" value="minutes">minute</option>
            <option key="hours" value="hours">hour</option>
            <option key="days" value="days">day</option>
            <option key="weeks" value="weeks">week</option>
            <option key="months" value="months">month</option>
            <option key="years" value="years">year</option>
          </select>
        </div>
        {/* Recent & Select */}
        <div className={`flex moble:flex-row desktop:flex-row mb-4`}>
          {/* Recent Symbols List */}
          <div className={`w-[30%] h-72 py-10`}>
            <p className={`text-lg mb-2`}>Recent...</p>
            <ul
              className={`items-start dark:bg-slate-800 dark:text-white bg-slate-50 text-black border border-slate-400 h-full overflow-y-auto`}
            >
              {recentSearches.length > 0 ? (
                recentSearches.map((searchItem) => (
                  <li
                    key={searchItem.value}
                    onClick={() => {
                      handleTickerChange({
                        key: searchItem.value,
                        value: searchItem.value,
                      });
                      handleRecentSearchClick(searchItem.value);
                    }}
                    className={`cursor-pointer p-2 hover:bg-indigo-500 hover:text-white border border-slate-300 dark:border-slate-600 ${selectedTicker?.value === searchItem.value
                      ? "bg-indigo-500 text-white"
                      : ""
                      }`}
                  >
                    {searchItem.label}
                  </li>
                ))
              ) : (
                <li className={`text-gray-500" key="No recent symbols.`}>No recent symbols.</li>
              )}
            </ul>
          </div>
          {/* Select Symbols List */}
          <div className={`w-[70%] h-72 py-10`}>
            <p className={`text-lg mb-2`}>Select...</p>
            <ul
              ref={tickerListDOMRef}
              className={`items-start dark:bg-slate-800 dark:text-slate-400 bg-slate-50 border border-slate-400 h-full overflow-y-auto`}
            >
              {tickerListRef.current?.map((tickerInfo) => (
                <li
                  key={tickerInfo.label}
                  onClick={() => {
                    handleTickerChange(tickerInfo);
                  }}
                  className={`cursor-pointer p-2  hover:text-white hover:bg-indigo-500 border`}
                >
                  {tickerInfo.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Input Stock Code & Info */}
        <div className={`flex mt-2`}>
          {" "}
          {/* Centered inputs */}
          <input
            className={`text-center bg-slate-50 text-slate-600 dark-text-slate-400 dark:bg-slate-800 border p-2 ml-1 h-10 w-full`}
            type="text"
            value={currentTickerRef.current}
            placeholder="Symbol. ex) AAPL, GOOGL, TSLA ..."
            onChange={(e) => {
              setCurrentTickerRef(e.target.value.toUpperCase());
              scrollToTicker(e.target.value.toUpperCase());
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                setSelectedTicker(currentTickerRef.current);
                scrollToTicker(currentTickerRef.current);
                handleStockRequest();
              }
            }}
          />
          <img
            onClick={viewDetailInfo}
            src="/detailInfo.png"
            alt="Info"
            className={`h-10 w-10 align-middle`}
          />

          <input
            ref={currentPriceTextColorRef}
            className={`text-center bg-slate-50 dark:bg-slate-800 border border-slate-400 h-10 w-full`}
            type="text"
            value={currentPriceRef.current ? currentPriceRef.current * selectedExchangeRef.current : ''}
            placeholder={`Current Price ${selectedCurrencyRef.current?.currency_code ? selectedCurrencyRef.current.currency_code : ''}`}
            readOnly
          />
          <img
            onClick={() => {
              setSelectedTicker(currentTickerRef.current);
              scrollToTicker(currentTickerRef.current);
              handleStockRequest();
            }}
            src="/refresh-icon.png" // 이미지 경로를 지정하세요
            alt="Refresh"
            className={`h-8 w-8 ml-1 mt-1 align-middle`} // 적절한 크기로 조정
          />
          <select
            className={`dark:text-slate-400 ml-2 bg-slate-50 dark:bg-slate-800`}
            value={selectedCurrencyRef.current?.currency_code}
            onChange={selectedCurrencyChanged}
          >
            {currencyListRef.current.map((currencyItem) => (
              <option
                key={`${currencyItem.currency_code}-${currencyItem.current_code}`} // 두 값을 결합하여 고유한 key 생성
                value={currencyItem.currency_code}
              >
                {currencyItem.currency_code}
              </option>
            ))}
          </select>
          <input
            className={`text-center bg-slate-50 dark:bg-slate-800 border border-slate-400 h-10 w-full ml-2`}
            type="text"
            value={selectedExchangeRef.current}
            placeholder={`Current Exchange`}
            readOnly
          />
        </div>
      </div>
    );
  }

  return (
    <DivContainer className={`flex flex-col`}>
      <BrunnerMessageBox />
      {loading && (
        <div className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50`}>
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900`}></div>
        </div>
      )}
      <div className={`flex flex-col`}>
        <SearchPanel className={`w-full`} />
        {currentTickerStockDataRef.current && (
          <div className={`flex flex-col w-full`}>
            {renderChart()}
          </div>
        )}
        {UserInfo.isLogin() &&
          <AssetContent></AssetContent>}
      </div>
    </DivContainer>
  );
};

export default StockContent;
