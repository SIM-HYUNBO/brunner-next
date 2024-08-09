`use strict`

import dotenv from 'dotenv';
import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import requestServer from './../../../components/requestServer';
import BrunnerMessageBox from '@/components/BrunnerMessageBox';
import dynamic from 'next/dynamic';
import RealtimeChart from './realtimeChart';
import { useTheme } from 'next-themes'
import Link from "next/link";

const Select = dynamic(() => import('react-select'), { ssr: false });
// ApexCharts를 동적으로 import
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

const StockContent = () => {

    const [loading, setLoading] = useState(false); // 로딩 상태 관리
    const [modalContent, setModalContent] = useState({
        isOpen: false,
        message: '',
        onConfirm: () => { },
        onClose: () => { },
    });

    const theme = useTheme();

    const isDarkMode = () => {
        return theme.theme === "dark";
    }

    const [defaultTicker, setDefaultTicker] = useState(''); // 주식 심볼

    const [stocksTicker, setStocksTicker] = useState(''); // 주식 심볼
    const stocksTickerRef = useRef(stocksTicker);
    const setStocksTickerRef = (newVal) => {
        setStocksTicker(newVal);
        stocksTickerRef.current = newVal;
        process.currentTicker = newVal;
        updateCurrentPrice(0);
    }

    const [stockData, setStockData] = useState(null); // 주식 데이터
    const stockDataRef = useRef(stockData);
    const setStockDataRef = (newVal) => {
        setStockData(newVal);
        stockDataRef.current = newVal;
    }

    const [dataIntervalUnit, setDataIntervalUnit] = useState("hour"); // 데이터 간격의  시간 단위
    const dataIntervalUnitRef = useRef(dataIntervalUnit);
    const setDataIntervalUnitRef = (newVal) => {
        setDataIntervalUnit(newVal);
        dataIntervalUnitRef.current = newVal;
    }
    const [period, setPeriod] = useState(15); // 기간
    const [periodUnit, setPeriodUnit] = useState('days'); // 기간 단위
    const periodUnitRef = useRef(periodUnit);
    const setPeriodUnitRef = (newVal) => {
        setPeriodUnit(newVal);
        periodUnitRef.current = newVal;
    }
    const [recentSearches, setRecentSearches] = useState([]); // 최근 검색 기록
    const [selectedOption, setSelectedOption] = useState(null); // 선택된 옵션

    // 종목 목록을 저장하기 위한 상태 추가
    const [tickerOptions, setTickerOptions] = useState([]);

    const [currentPrice, setCurrentPrice] = useState(); // 기간 단위
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

    const [currentPriceTextColor, setCurrentPriceTextColor] = useState(); // 기간 단위
    const currentPriceTextColorRef = useRef(currentPriceTextColor);
    const setCurrentPriceTextColorRef = (newValue) => {
        setCurrentPriceTextColor(newValue);
        currentPriceTextColorRef.current = newValue;

    };

    const [tickerList, setTickerList] = useState(); // 기간 단위
    const tickerListRef = useRef(tickerList);
    const setTickerListRef = (newValue) => {
        setTickerList(newValue);
        tickerListRef.current = newValue;
        process.tickerList = newValue;

    };

    // useEffect를 사용하여 최근 검색한 종목 코드 로드
    useEffect(() => {
        const storedSearches = localStorage.getItem('recentSearches');
        if (storedSearches) {
            setRecentSearches(JSON.parse(storedSearches));
        }

        const defaultTicker = localStorage.getItem('defaultTicker');
        if (defaultTicker) {
            setDefaultTicker(defaultTicker);
            setStocksTickerRef(defaultTicker);
            handleStockRequest();
        }

        // 컴포넌트가 마운트될 때 티커 목록 가져오기
        setTickerListRef(process.tickerList);
        displayTickerList();

        if (!tickerListRef.current)
            fetchTickerList();
    }, []);

    // 모달 열기 함수
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

    const fetchTickerList = async () => {
        try {
            const jRequest = {
                commandName: 'stock.getTickerList',
                systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE
            };

            setLoading(true);
            setStockDataRef(null);
            const jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                setTickerListRef(jResponse.tickerList);
                displayTickerList();
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

    const displayTickerList = () => {
        // 여기서 조회한 종목 목록을 콤보박스에 표시
        const options = ticerListRef.current.map(ticker => ({
            value: ticker.ticker_code, // ticker_code 사용
            label: `${ticker.ticker_code} - ${ticker.ticker_desc}` // ticker_desc 사용
        }));
        setTickerOptions(options);
    }

    // 주식 데이터를 가져오는 함수
    const fetchStockData = async () => {
        try {
            const timefrom = moment().subtract(period, periodUnitRef.current).format('YYYY-MM-DD');
            const timeto = moment().format('YYYY-MM-DD');

            const jRequest = {
                commandName: 'stock.getStockInfo',
                systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
                stocksTicker: stocksTickerRef.current,
                multiplier: 1,
                timespan: dataIntervalUnitRef.current,
                from: timefrom,
                to: timeto,
                adjust: true,
                sort: 'desc',
                limit: '',
            };

            setLoading(true);
            setStockDataRef(null);
            const jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                setStockDataRef(jResponse.stockInfo);


                // 최근 검색 기록 업데이트 (정상 조회된 종목만)
                if (jResponse.stockInfo) {
                    const newSearch = {
                        value: stocksTickerRef.current,
                        label: stocksTickerRef.current,
                    };
                    const updatedSearches = [
                        newSearch,
                        ...recentSearches.filter((s) => s.value !== stocksTickerRef.current),
                    ].slice(0, 10); // 최대 10개까지 저장
                    setRecentSearches(updatedSearches);
                    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
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

    // 주식 데이터 요청 처리
    const handleStockRequest = (event) => {
        if (event)
            event.preventDefault();

        if (!stocksTickerRef.current) {
            setModalContent({
                isOpen: true,
                message: '주식 심볼을 입력해 주세요.',
                onConfirm: () => setModalContent({ ...modalContent, isOpen: false }),
                onClose: () => setModalContent({ ...modalContent, isOpen: false }),
            });
            return;
        }
        fetchStockData();
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

    const calculateMACD = (data, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) => {
        const shortEMA = calculateEMA(data, shortPeriod);
        const longEMA = calculateEMA(data, longPeriod);
        const macd = [];

        // MACD 라인 계산
        for (let i = 0; i < data.length; i++) {
            if (i >= longPeriod - 1 && shortEMA[i] && longEMA[i]) { // shortEMA[i]와 longEMA[i] 체크
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
            if (signalLine[index]) { // 시그널 라인 존재 여부 체크
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
                const squaredDiffs = window.map(w => Math.pow(w.y - sma[index - period + 1].y, 2));
                const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
                const stdDev = Math.sqrt(variance);
                const middleBand = sma[index - period + 1].y;
                const upperBand = middleBand + multiplier * stdDev;
                const lowerBand = middleBand - multiplier * stdDev;

                return {
                    x: d.x,
                    upperBand,
                    middleBand,
                    lowerBand
                };
            } else {
                return { x: d.x, upperBand: null, middleBand: null, lowerBand: null };
            }
        });

        return bollingerBands;
    };

    // 티커 선택 시 기본 티커 업데이트
    const handleTickerChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        setStocksTickerRef(selectedOption ? selectedOption.value : '');
        handleStockRequest();
    };

    // 차트 렌더링을 위한 준비
    const renderChart = () => {
        if (!stockDataRef.current) return null;

        const priceData = stockDataRef.current.map((d) => ({
            x: new Date(d.t).getTime(),
            y: d.c,
        }));

        const sma = calculateSMA(priceData);
        const ema = calculateEMA(priceData);
        const rsi = calculateRSI(priceData);
        const macdData = calculateMACD(priceData);
        const bollingerBands = calculateBollingerBands(priceData);

        const chartOptions = {
            chart: {
                type: 'line',
                height: 350,
                zoom: {
                    enabled: true,
                },
            },
            stroke: {
                width: [1, 1, 1], // 각 선의 두께 설정
                curve: 'smooth', // 부드러운 곡선
            },
            title: {
                text: `${stocksTickerRef.current} History`,
                align: 'left',
                style: {
                    color: '#94a3b8' // slate-400 색상 설정
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    style: {
                        colors: '#94a3b8'
                    },
                    format: 'MM/dd HH:mm',
                }
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return val;
                    },
                    style: {
                        colors: '#94a3b8' // slate-400 색상 설정
                    }
                }
            },
            series: [
                {
                    name: 'Price (USD)',
                    data: priceData,
                },
                {
                    name: 'SMA',
                    data: sma,
                },
                {
                    name: 'EMA',
                    data: ema,
                },
            ],
            legend: {
                labels: {
                    colors: ['#94a3b8', '#94a3b8', '#94a3b8']
                }
            },
        };

        const rsiOptions = {
            chart: {
                type: 'line',
                height: 150,
                zoom: {
                    enabled: false,
                },
            },
            stroke: {
                width: [1], // 각 선의 두께 설정
                curve: 'smooth', // 부드러운 곡선
            },
            title: {
                text: `${stocksTickerRef.current} RSI`,
                align: 'left',
                style: {
                    color: '#94a3b8' // slate-400 색상 설정
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    datetimeUTC: false, // UTC가 아닌 로컬 시간대로 표시합니다.
                    format: 'MM/dd HH:mm', // 'dd MMM'은 날짜와 시간을 모두 보여줍니다. (예: 03 Aug 13:00)
                    style: {
                        colors: '#9e9e9e', // x축 레이블 색상
                        //fontSize: '12px',  // x축 레이블 폰트 크기
                        fontFamily: 'Arial, sans-serif', // x축 레이블 폰트 패밀리
                    }
                },
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return val;
                    },
                    style: {
                        colors: '#94a3b8' // slate-400 색상 설정
                    }
                }
            },
            series: [
                {
                    name: 'RSI',
                    data: rsi,
                },
            ],
            legend: {
                labels: {
                    colors: ['#94a3b8']
                }
            }
        };

        const macdOptions = {
            chart: {
                type: 'line',
                height: 150,
                zoom: {
                    enabled: false,
                },
            },
            stroke: {
                width: [1, 1, 1], // 각 선의 두께 설정
                curve: 'smooth', // 부드러운 곡선
            },
            title: {
                text: `${stocksTickerRef.current} MACD`,
                align: 'left',
                style: {
                    color: '#94a3b8' // slate-400 색상 설정
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    datetimeUTC: false, // UTC가 아닌 로컬 시간대로 표시합니다.
                    format: 'MM/dd HH:mm', // 'dd MMM'은 날짜와 시간을 모두 보여줍니다. (예: 03 Aug 13:00)
                    style: {
                        colors: '#9e9e9e', // x축 레이블 색상
                        //fontSize: '12px',  // x축 레이블 폰트 크기
                        fontFamily: 'Arial, sans-serif', // x축 레이블 폰트 패밀리
                    }
                },
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return val;
                    },
                    style: {
                        colors: '#94a3b8' // slate-400 색상 설정
                    }
                }
            },
            series: [
                {
                    name: 'MACD',
                    data: macdData.macd,
                },
                {
                    name: 'Signal Line',
                    data: macdData.signalLine,
                },
                {
                    name: 'Histogram',
                    type: 'bar',
                    data: macdData.histogram,
                },
            ],
            legend: {
                labels: {
                    colors: ['#94a3b8', '#94a3b8', '#94a3b8']
                }
            }
        };

        const bollingerOptions = {
            chart: {
                type: 'line',
                height: 350,
                zoom: {
                    enabled: true,
                },
            },
            stroke: {
                width: [1, 1, 1, 1], // 각 선의 두께 설정
                curve: 'smooth', // 부드러운 곡선
            },
            title: {
                text: `${stocksTickerRef.current} Bollinger Bands`,
                align: 'left',
                style: {
                    color: '#94a3b8' // slate-400 색상 설정
                }
            },
            xaxis: {
                type: 'datetime',
                title: {
                    style: {
                        color: '#94a3b8' // slate-400 색상 설정
                    }
                },
                labels: {
                    datetimeUTC: false, // UTC가 아닌 로컬 시간대로 표시합니다.
                    format: 'MM/dd HH:mm', // 'dd MMM'은 날짜와 시간을 모두 보여줍니다. (예: 03 Aug 13:00)
                    style: {
                        colors: '#9e9e9e', // x축 레이블 색상
                        //fontSize: '12px',  // x축 레이블 폰트 크기
                        fontFamily: 'Arial, sans-serif', // x축 레이블 폰트 패밀리
                    }
                },
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return val;
                    },
                    style: {
                        colors: '#94a3b8' // slate-400 색상 설정
                    }
                },
                title: {
                    style: {
                        color: '#94a3b8' // slate-400 색상 설정
                    }
                }
            },
            series: [
                {
                    name: 'Price (USD)',
                    data: priceData,
                },
                {
                    name: 'Upper Band',
                    data: bollingerBands.map((b) => ({ x: b.x, y: b.upperBand })),
                },
                {
                    name: 'Middle Band',
                    data: bollingerBands.map((b) => ({ x: b.x, y: b.middleBand })),
                },
                {
                    name: 'Lower Band',
                    data: bollingerBands.map((b) => ({ x: b.x, y: b.lowerBand })),
                },
            ],
            legend: {
                labels: {
                    colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8']
                }
            }
        };


        return (
            <div className="w-full mt-5">
                <RealtimeChart updateCurrentPrice={updateCurrentPrice} ></RealtimeChart>
                <ApexCharts options={chartOptions} series={chartOptions.series} type="line" height={350} width={'100%'} />
                <ApexCharts options={rsiOptions} series={rsiOptions.series} type="line" height={350} width={'100%'} />
                <ApexCharts options={macdOptions} series={macdOptions.series} type="line" height={350} width={'100%'} />
                <ApexCharts options={bollingerOptions} series={bollingerOptions.series} type="line" height={350} width={'100%'} />
            </div>
        );
    };

    const darkSelectionStyle = {
        container: (provided) => ({
            ...provided,
            marginTop: '1em',
            marginBottom: '1em',
        }),
        control: (provided) => ({
            ...provided,
            backgroundColor: 'rgb(30, 41, 59)', // bg-slate-800 color
            width: '100%',

        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'rgb(156, 163, 175)', // 선택된 값의 글자 색상
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? 'rgb(51, 65, 85)' : 'rgb(30, 41, 59)', // bg-slate-700 on focus
            color: state.isSelected ? 'white' : 'rgb(156, 163, 175)',

        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'rgb(30, 41, 59)', // bg-slate-800
            color: 'rgb(156, 163, 175)',        // text-slate-400  => 목록 글씨색
            borderRadius: '0.375rem',
        }),
    };

    const lightSelectionStyle = {
        container: (provided) => ({
            ...provided,
            marginTop: '1em',
            marginBottom: '1em',
        }),
        control: (provided) => ({
            ...provided,
            backgroundColor: 'white', // bg-slate-800 color
            width: '100%'
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'rgb(156, 163, 175)', // 선택된 값의 글자 색상
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: 'white', // bg-slate-700 on focus
            color: state.isSelected ? 'black' : 'rgb(156, 163, 175)',
        }),
        menu: (provided) => ({ // 목록
            ...provided,
            backgroundColor: 'white', // bg-slate-800
            color: 'rgb(156, 163, 175)',        // text-slate-400  => 목록 글씨색
            borderRadius: '0.375rem',
        }),
    };

    return (
        <div className='w-full'>
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            )}
            <div>
                <h1 className="title-font sm:text-4xl text-3xl my-10 font-medium text-green-900">
                    Stock search
                </h1>
                <div className="items-start mt-2 dark:text-slate-400">
                    <label>Span</label>
                    <select
                        className="dark:text-slate-400 ml-2 bg-slate-50 dark:bg-slate-800"
                        value={dataIntervalUnitRef.current}
                        onChange={(e) => setDataIntervalUnitRef(e.target.value)}
                    >
                        <option value="minute">minute</option>
                        <option value="hour">hour</option>
                        <option value="day">day</option>
                        <option value="week">week</option>
                        <option value="month">month</option>
                        <option value="year">year</option>
                    </select>
                </div>
                <div className="items-start mt-2 dark:text-slate-400">
                    <label className="dark:text-slate-400 dark:bg-slate-800">
                        Period
                        <input
                            className="dark:text-slate-400 ml-2 text-center bg-slate-50 dark:bg-slate-800"
                            type="number"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            min="1"
                        />
                    </label>
                    <select
                        className="ml-2 text-center dark:text-slate-400 bg-slate-50 dark:bg-slate-800"
                        value={periodUnitRef.current}
                        onChange={(e) => setPeriodUnitRef(e.target.value)}
                    >
                        <option value="minutes">minute</option>
                        <option value="hours">hour</option>
                        <option value="days">day</option>
                        <option value="weeks">week</option>
                        <option value="months">month</option>
                        <option value="years">year</option>
                    </select>
                </div>

                {/* Flex container for horizontal layout */}
                <div className="flex mb-4">
                    {/* Recent Symbols List */}
                    <div className="w-[30%] h-72 py-10">
                        <h3 className="font-bold text-lg mb-2">Recent...</h3>
                        <ul
                            className={`items-start ${isDarkMode() ? "bg-slate-800 text-white" : "bg-slate-50 text-black"
                                } border border-slate-400 h-full overflow-y-auto`}
                        >
                            {recentSearches.length > 0 ? (
                                recentSearches.map((searchItem) => (
                                    <li
                                        key={searchItem.value}
                                        onClick={() => {
                                            handleTickerChange({ key: searchItem.value, value: searchItem.value });
                                        }}
                                        className={`cursor-pointer p-2 hover:bg-indigo-500 hover:text-white ${selectedOption?.value === searchItem.value
                                            ? "bg-indigo-500 text-white"
                                            : ""
                                            }`}
                                    >
                                        {searchItem.label}
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500">No recent symbols.</li>
                            )}
                        </ul>
                    </div>

                    {/* Select Symbols List */}
                    <div className="w-[70%] h-72 py-10">
                        <h3 className="font-bold text-lg mb-2">Select...</h3>
                        <ul
                            className={`items-start ${isDarkMode() ? "bg-slate-800 text-white" : "bg-slate-50 text-black"
                                } border border-slate-400 h-full overflow-y-auto`}
                        >
                            {tickerOptions.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => {
                                        handleTickerChange(option);
                                    }}
                                    className={`cursor-pointer p-2 hover:bg-indigo-500 hover:text-white ${selectedOption?.value === option.value
                                        ? "bg-indigo-500 text-white"
                                        : ""
                                        }`}
                                >
                                    {option.label}
                                </li>
                            ))
                            }
                        </ul>
                    </div>
                </div>

                {/* Input Fields and Refresh Button */}
                <div className="flex mt-4" > {/* Centered inputs */}
                    <input
                        className="text-center bg-indigo-500 text-white p-2 ml-1 h-10 w-[30%]"
                        type="text"
                        value={stocksTickerRef.current}
                        placeholder="Manual input. ex) AAPL, GOOGL, TSLA ..."
                        onChange={(e) => {
                            setStocksTickerRef(e.target.value.toUpperCase());
                            setSelectedOption("");
                        }}
                    />
                    <input
                        className={`text-center text-${currentPriceTextColorRef.current} bg-slate-50 dark:bg-slate-800 border border-slate-400 h-10 w-[30%]`}
                        type="text"
                        value={currentPriceRef.current}
                        placeholder="Current Price ..."
                    />
                    <button
                        className="bg-indigo-500 text-white py-2 px-4 ml-1 h-10"
                        type="submit"
                        onClick={handleStockRequest}
                    >
                        Refresh
                    </button>
                    <Link
                        className="bg-indigo-500 text-white py-2 px-4 ml-1 h-10"
                        href={{ pathname: '/mainPages/tickerInfo', query: `currentStockTicker=${stocksTickerRef.current}` }}>
                        News...
                    </Link>
                </div>
            </div>

            <BrunnerMessageBox
                isOpen={modalContent.isOpen}
                message={modalContent.message}
                onConfirm={modalContent.onConfirm}
                onClose={modalContent.onClose}
            />
            {stockDataRef.current && renderChart()}
        </div >
    );
};

export default StockContent;
