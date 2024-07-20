import { useState, useEffect } from 'react';
import moment from 'moment';
import requestServer from './../../../components/requestServer';
import BrunnerMessageBox from '@/components/BrunnerMessageBox';
import dynamic from 'next/dynamic';
import Select from 'react-select';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

const StockContent = () => {
    const [loading, setLoading] = useState(false);
    const [modalContent, setModalContent] = useState({
        isOpen: false,
        message: '',
        onConfirm: () => { },
        onClose: () => { },
    });
    const [stocksTicker, setStocksTicker] = useState('');
    const [stockData, setStockData] = useState(null);
    const [error, setError] = useState(null);
    const [timespan, setTimespan] = useState('month');
    const [duration, setDuration] = useState(10);
    const [durationUnit, setDurationUnit] = useState('months');
    const [recentSearches, setRecentSearches] = useState([]);
    const [defaultTicker, setDefaultTicker] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);

    // useEffect를 사용하여 최근 검색한 종목 코드 로드
    useEffect(() => {
        const recentSearchesString = localStorage.getItem('recentSearches');
        if (recentSearchesString) {
            const searches = JSON.parse(recentSearchesString);
            setRecentSearches(searches);
            if (searches.length > 0) {
                setDefaultTicker(searches[0]);
            }
        }
    }, []);

    // useEffect를 사용하여 최근 검색한 종목 코드 저장
    useEffect(() => {
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }, [recentSearches]);

    const openModal = (message) => {
        return new Promise((resolve, reject) => {
            setModalContent({
                isOpen: true,
                message: message,
                onConfirm: (result) => {
                    resolve(result);
                    closeModal();
                },
                onClose: () => {
                    reject(false);
                    closeModal();
                },
            });
        });
    };

    const closeModal = () => {
        setModalContent({
            isOpen: false,
            message: '',
            onConfirm: () => { },
            onClose: () => { },
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedTicker = stocksTicker.trim();
        if (!trimmedTicker) {
            setError('주식 심볼을 선택해주세요.');
            return;
        }

        setLoading(true);
        try {
            const timefrom = moment().subtract(duration, durationUnit).format('YYYY-MM-DD');
            const timeto = moment().format('YYYY-MM-DD');

            const jRequest = {
                commandName: 'stock.getStockInfo',
                systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
                stocksTicker: trimmedTicker,
                multiplier: 1,
                timespan: timespan,
                from: timefrom,
                to: timeto,
                adjust: true,
                sort: 'desc',
                limit: '',
            };

            const jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                setStockData(jResponse.stockInfo);
                const updatedRecentSearches = [
                    trimmedTicker,
                    ...recentSearches.filter((item) => item !== trimmedTicker),
                ].slice(0, 10);
                setRecentSearches(updatedRecentSearches);
            } else {
                openModal(jResponse.error_message);
            }
        } catch (error) {
            console.error('예상치 못한 오류:', error);
            openModal('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const calculateRSI = (data, period) => {
        let rs = 0;
        let gains = 0;
        let losses = 0;

        for (let i = 1; i < data.length; i++) {
            const diff = data[i].c - data[i - 1].c;
            if (diff > 0) {
                gains += diff;
            } else {
                losses += Math.abs(diff);
            }
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;
        rs = avgGain / avgLoss;

        const rsi = 100 - (100 / (1 + rs));
        return rsi.toFixed(2);
    };

    const calculateMACD = (data) => {
        const shortEMA = calculateEMA(data, 12);
        const longEMA = calculateEMA(data, 26);
        const macdLine = shortEMA - longEMA;
        const signalLine = calculateEMA(data, 9, macdLine);
        return { macdLine, signalLine };
    };

    const calculateEMA = (data, period, prevEMA = null) => {
        const smoothingFactor = 2 / (period + 1);
        let ema = prevEMA
            ? data[data.length - 1].c * smoothingFactor + prevEMA * (1 - smoothingFactor)
            : data.slice(0, period).reduce((a, b) => a + b) / period;
        return ema;
    };

    const calculateBollingerBands = (data, period) => {
        const middleBand = calculateSMA(data, period);
        const stdDev = calculateStandardDeviation(data, period);
        const upperBand = middleBand + 2 * stdDev;
        const lowerBand = middleBand - 2 * stdDev;
        return { upperBand, middleBand, lowerBand };
    };

    const calculateSMA = (data, period) => {
        const sum = data.slice(0, period).reduce((a, b) => a + b) / period;
        return sum;
    };

    const calculateStandardDeviation = (data, period) => {
        const mean = calculateSMA(data, period);
        const sumOfSquares = data
            .slice(0, period)
            .reduce((a, b) => a + Math.pow(b - mean, 2), 0);
        const stdDev = Math.sqrt(sumOfSquares / period);
        return stdDev;
    };

    const calculateStochasticOscillator = (data, period) => {
        const high = Math.max(...data.slice(0, period).map((item) => item.h));
        const low = Math.min(...data.slice(0, period).map((item) => item.l));
        const close = data[data.length - 1].c;
        const stochasticOscillator =
            ((close - low) / (high - low)) * 100;
        return stochasticOscillator.toFixed(2);
    };

    const prepareChartData = () => {
        if (!stockData) return [];

        const candlestickData = stockData.map((item) => ({
            x: new Date(item.t),
            y: [item.o, item.h, item.l, item.c],
        }));

        const { macdLine, signalLine } = calculateMACD(stockData);
        const rsiData = calculateRSI(stockData, 14);
        const { upperBand, middleBand, lowerBand } = calculateBollingerBands(stockData, 20);
        const stochasticOscillatorData = calculateStochasticOscillator(stockData, 14);

        return [
            {
                name: '캔들스틱',
                type: 'candlestick',
                data: candlestickData,
            },
            {
                name: 'MACD',
                type: 'line',
                data: [
                    { x: new Date(stockData[0].t), y: macdLine },
                    { x: new Date(stockData[0].t), y: signalLine },
                ],
            },
            {
                name: 'Bollinger Bands',
                type: 'line',
                data: [
                    { x: new Date(stockData[0].t), y: upperBand },
                    { x: new Date(stockData[0].t), y: middleBand },
                    { x: new Date(stockData[0].t), y: lowerBand },
                ],
            },
            {
                name: 'RSI',
                type: 'line',
                data: [{ x: new Date(stockData[0].t), y: rsiData }],
            },
            {
                name: 'EMA',
                type: 'line',
                data: [{ x: new Date(stockData[0].t), y: calculateEMA(stockData, 12) }],
            },
            {
                name: 'Stochastic Oscillator',
                type: 'line',
                data: [{ x: new Date(stockData[0].t), y: stochasticOscillatorData }],
            },
        ];
    };

    const chartOptionsDark = {
        chart: {
            height: '100%',
            type: 'line',
            foreColor: '#ffffff', // 다크모드에서 텍스트 색상을 밝게 설정
        },
        title: {
            text: '차트 및 보조지표',
            align: 'left',
            style: {
                color: '#ffffff', // 다크모드에서 텍스트 색상을 밝게 설정
            },
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#ffffff', // 다크모드에서 텍스트 색상을 밝게 설정
                },
            },
        },
        yaxis: {
            tooltip: {
                enabled: true,
            },
            labels: {
                style: {
                    colors: '#ffffff', // 다크모드에서 텍스트 색상을 밝게 설정
                },
            },
        },
        tooltip: {
            x: {
                format: 'dd MMM yyyy',
            },
        },
        legend: {
            position: 'top',
            labels: {
                colors: '#ffffff', // 다크모드에서 텍스트 색상을 밝게 설정
            },
        },
    };

    const chartOptionsLight = {
        chart: {
            height: '100%',
            type: 'line',
            foreColor: '#333333', // 라이트모드에서 텍스트 색상을 어둡게 설정
        },
        title: {
            text: '차트 및 보조지표',
            align: 'left',
            style: {
                color: '#333333', // 라이트모드에서 텍스트 색상을 어둡게 설정
            },
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#333333', // 라이트모드에서 텍스트 색상을 어둡게 설정
                },
            },
        },
        yaxis: {
            tooltip: {
                enabled: true,
            },
            labels: {
                style: {
                    colors: '#333333', // 라이트모드에서 텍스트 색상을 어둡게 설정
                },
            },
        },
        tooltip: {
            x: {
                format: 'dd MMM yyyy',
            },
        },
        legend: {
            position: 'top',
            labels: {
                colors: '#333333', // 라이트모드에서 텍스트 색상을 어둡게 설정
            },
        },
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            width: '100%',
            border: '1px solid #d1d5db',
            backgroundColor: process.env.isDarkMode == true ? 'black' : 'white', // 다크모드와 라이트모드에 따라 배경색 설정
            color: process.env.isDarkMode == true ? '#ffffff' : '#333333', // 다크모드와 라이트모드에 따라 텍스트 색상 설정
        }),
        option: (provided, state) => ({
            ...provided,
            color: process.env.isDarkMode == true ? '#ffffff' : '#333333', // 다크모드와 라이트모드에 따라 텍스트 색상 설정
        }),
    };

    const handleSelectChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        if (selectedOption) {
            setStocksTicker(selectedOption.value);
        }
    };

    return (
        <div className="w-full h-full">
            <BrunnerMessageBox
                isOpen={modalContent.isOpen}
                message={modalContent.message}
                onConfirm={modalContent.onConfirm}
                onClose={modalContent.onClose}
            />
            <div className="lg:flex-grow flex flex-col md:items-start md:text-left items-center text-center w-full">
                <h1 className="title-font sm:text-4xl text-3xl font-medium text-green-900">
                    차트 보기
                </h1>
                <div className="main-governing-text mt-5">
                    시야를 넓혀 최고 수익에 도전하고 <br />
                    은퇴 전 백억 자산가가 되세요.
                </div>
                <div className="border-0 focus:ring-0 bg-transparent w-full text-sm text-gray-900 dark:text-gray-300">
                    <Select
                        options={recentSearches.map((ticker) => ({
                            value: ticker,
                            label: ticker,
                        }))}
                        value={selectedOption}
                        onChange={handleSelectChange}
                        styles={customStyles}
                    />
                    <div className="flex items-center mt-2 justify-start">
                        <input
                            className="p-2 border rounded dark:text-gray-300 w-full"
                            type="text"
                            value={stocksTicker}
                            onChange={(e) => setStocksTicker(e.target.value.toUpperCase())}
                            placeholder="또는 종목 심볼 입력"
                        />
                    </div>
                    <div className="flex items-center mt-2">
                        <label className="mr-4">
                            <input
                                type="radio"
                                value="minute"
                                checked={timespan === 'minute'}
                                onChange={() => setTimespan('minute')}
                            />
                            분
                        </label>
                        <label className="mr-4">
                            <input
                                type="radio"
                                value="hour"
                                checked={timespan === 'hour'}
                                onChange={() => setTimespan('hour')}
                            />
                            시간
                        </label>
                        <label className="mr-4">
                            <input
                                type="radio"
                                value="day"
                                checked={timespan === 'day'}
                                onChange={() => setTimespan('day')}
                            />
                            일
                        </label>
                        <label className="mr-4">
                            <input
                                type="radio"
                                value="month"
                                checked={timespan === 'month'}
                                onChange={() => setTimespan('month')}
                            />
                            월
                        </label>
                        <input
                            className="p-2 border rounded dark:text-gray-300 w-24 ml-4"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            placeholder="시간"
                            required
                        />
                        <select
                            className="p-2 border rounded dark:text-gray-300 ml-2"
                            value={durationUnit}
                            onChange={(e) => setDurationUnit(e.target.value)}
                        >
                            <option value="minutes">분</option>
                            <option value="hours">시간</option>
                            <option value="days">일</option>
                            <option value="months">월</option>
                            <option value="years">년</option>
                        </select>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-2"
                        style={{ alignSelf: 'flex-end' }}
                        disabled={loading}
                    >
                        검색
                    </button>

                    {loading && (
                        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                        </div>
                    )}
                    {error && <p>{error}</p>}

                    {stockData && (
                        <div className="mt-5 w-full h-screen">
                            <ApexCharts
                                options={process.env.isDarkMode == true ? chartOptionsDark : chartOptionsLight} // 테마에 따라 차트 옵션 변경
                                series={prepareChartData()}
                                type="line"
                                height={'100%'}
                                width={'100%'}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockContent;
