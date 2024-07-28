import dotenv from 'dotenv';
import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import requestServer from './../../../components/requestServer';
import BrunnerMessageBox from '@/components/BrunnerMessageBox';
import dynamic from 'next/dynamic';
import Select from 'react-select';

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
    const [stocksTicker, setStocksTicker] = useState(''); // 주식 심볼
    const [defaultTicker, setDefaultTicker] = useState(''); // 주식 심볼
    const stocksTickerRef = useRef(stocksTicker);

    const setStocksTickerRef = (newVal) => {
        setStocksTicker(newVal);
        stocksTickerRef.current = newVal;
    }

    const [stockData, setStockData] = useState(null); // 주식 데이터
    const [timespan, setTimespan] = useState('hour'); // 데이터의 시간 범위
    const [duration, setDuration] = useState(15); // 기간
    const [durationUnit, setDurationUnit] = useState('days'); // 기간 단위
    const [recentSearches, setRecentSearches] = useState([]); // 최근 검색 기록
    const [selectedOption, setSelectedOption] = useState(null); // 선택된 옵션

    var wsClient = null; // Web Socket 클라이언트
    const [wsConnected, setWsConnected] = useState(false); //실시간 Web Socket 채널 연결상태
    const [wsStockData, setWsStockData] = useState(null); // 실시간 Web Socket 주식 데이터
    const [wsClientId, setWsClientId] = useState(null);

    // useEffect를 사용하여 최근 검색한 종목 코드 로드
    useEffect(() => {
        const storedSearches = localStorage.getItem('recentSearches');
        if (storedSearches) {
            setRecentSearches(JSON.parse(storedSearches));
        }

        const defaultTicker = localStorage.getItem('defaultTicker');
        if (defaultTicker) {
            setStocksTickerRef(defaultTicker);
        }
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

    // 주식 데이터를 가져오는 함수
    const fetchStockData = async () => {
        try {
            const timefrom = moment().subtract(duration, durationUnit).format('YYYY-MM-DD');
            const timeto = moment().format('YYYY-MM-DD');

            const jRequest = {
                commandName: 'stock.getStockInfo',
                systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
                stocksTicker: stocksTickerRef.current,
                multiplier: 1,
                timespan: timespan,
                from: timefrom,
                to: timeto,
                adjust: true,
                sort: 'desc',
                limit: '',
            };

            setLoading(true);
            const jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                setStockData(jResponse.stockInfo);


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

    // 기본 티커 설정
    useEffect(() => {
        const storedTicker = localStorage.getItem('defaultTicker');
        if (storedTicker) {
            setDefaultTicker(storedTicker);
            setStocksTickerRef(storedTicker);
        }

        wsClient = new EventSource('/api/biz/websocketServer');
        onConnect(wsClient);

        return () => {
            wsClient.close(); // 컴포넌트 언마운트 시 연결 종료
            wsClient = null;
        };
    }, []);

    // 티커 선택 시 기본 티커 업데이트
    const handleTickerChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        setStocksTickerRef(selectedOption ? selectedOption.value : '');

        handleStockRequest();

        if (wsClientId)
            subscribe(wsClientId, stocksTickerRef.current);
    };

    // 차트 렌더링을 위한 준비
    const renderChart = () => {
        if (!stockData) return null;

        const priceData = stockData.map((d) => ({
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
                text: `${stocksTickerRef.current} 차트`,
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
                    }
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
                    name: '가격',
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
                text: 'RSI',
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
                    }
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
                text: 'MACD',
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
                    }
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
                text: 'Bollinger Bands',
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
                    style: {
                        colors: '#94a3b8'
                    }
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
                },
                title: {
                    style: {
                        color: '#94a3b8' // slate-400 색상 설정
                    }
                }
            },
            series: [
                {
                    name: '가격',
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
                <ApexCharts options={chartOptions} series={chartOptions.series} type="line" height={350} width={'100%'} />
                <ApexCharts options={rsiOptions} series={rsiOptions.series} type="line" height={350} width={'100%'} />
                <ApexCharts options={macdOptions} series={macdOptions.series} type="line" height={350} width={'100%'} />
                <ApexCharts options={bollingerOptions} series={bollingerOptions.series} type="line" height={350} width={'100%'} />
            </div>
        );
    };

    // 실시간 데이터 수신 처리 ( Web Socket )
    const onConnect = (wsClient) => {
        wsClient.onopen = () => {
            console.log('Web Socket  서버에 연결되었습니다.');
            setWsConnected(true);
        };

        wsClient.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(`${data.type} 수신: ${event.data}`);

            if (data.type === 'sessionInfo') {
                setWsClientId(data.clientId);
            }
            setWsStockData(data);
        };

        wsClient.onerror = (error) => {
            console.error('서버 연결 에러:', error);
            setWsConnected(false);
            wsClient.close(); // 에러 발생 시 연결 종료
            setWsClientId(null);
        };
    }

    const subscribe = async (clientId, stocksTicker) => {
        const res = await fetch('/api/biz/websocketServer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    'type': 'subscribe',
                    'clientId': clientId,
                    'ticker': stocksTicker
                }),
        });

        if (!res.ok) {
            openModal(`Stock subscribe errror! Status: ${res.status}`)
        }
    }

    return (
        <div className='w-full'>
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            )}
            <div>
                <div className='items-start mt-2 text-slate-400'>
                    <label>
                        단위:
                    </label>
                    <select className='text-slate-600 ml-2 bg-slate-50 dark:bg-slate-400' value={timespan} onChange={(e) => setTimespan(e.target.value)}>
                        <option value="minute">분</option>
                        <option value="hour">시간</option>
                        <option value="day">일</option>
                        <option value="week">주</option>
                        <option value="month">월</option>
                        <option value="year">년</option>
                    </select>
                </div>
                <label className='text-slate-400'>
                    기간:
                    <input className='text-slate-600 ml-2 text-center bg-slate-50 dark:bg-slate-400'
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        min="1"
                    />
                </label>
                <select className='ml-2 text-center bg-slate-50 dark:bg-slate-400' value={durationUnit} onChange={(e) => setDurationUnit(e.target.value)}>
                    <option value="minutes">분</option>
                    <option value="hours">시간</option>
                    <option value="days">일</option>
                    <option value="weeks">주</option>
                    <option value="months">월</option>
                    <option value="years">년</option>
                </select>
                <div>
                    <Select className='items-start'
                        value={selectedOption}
                        onChange={handleTickerChange}
                        options={recentSearches}
                        placeholder="Select Symbol ..."
                        isClearable
                        noOptionsMessage={() => "최근 검색 기록이 없습니다."}
                        styles={{
                            container: (provided) => ({
                                ...provided,
                                marginTop: '1em',
                                marginBottom: '1em',
                            }),
                        }}
                    />
                    <input className='item-start text-center bg-slate-50 dark:bg-slate-400'
                        type="text"
                        value={stocksTickerRef.current}
                        onChange={(e) => {
                            setStocksTickerRef(e.target.value);
                            setSelectedOption("");
                        }}
                    />
                    <button className='text-slate-400 ml-2' type="submit" onClick={handleStockRequest}>Refresh</button>
                </div>
            </div>

            <BrunnerMessageBox
                isOpen={modalContent.isOpen}
                message={modalContent.message}
                onConfirm={modalContent.onConfirm}
                onClose={modalContent.onClose}
            />
            {stockData && renderChart()}
        </div>
    );
};

export default StockContent;