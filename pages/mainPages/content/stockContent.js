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
        const highValues = data.slice(0, period).map(item => item.h);
        const lowValues = data.slice(0, period).map(item => item.l);
        const closeValues = data.slice(0, period).map(item => item.c);

        const high = Math.max(...highValues);
        const low = Math.min(...lowValues);
        const close = closeValues[closeValues.length - 1];

        const stochasticOscillator = ((close - low) / (high - low)) * 100;
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
            text: stocksTicker,
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
            text: stocksTicker,
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
        <div className="w-full  h-full">
            <BrunnerMessageBox
                isOpen={modalContent.isOpen}
                message={modalContent.message}
                onConfirm={modalContent.onConfirm}
                onClose={modalContent.onClose}
            />
            <div className="lg:flex-grow flex flex-col md:items-start md:text-left items-center text-center w-full h-full">
                <h1 className="title-font sm:text-4xl text-3xl font-medium text-green-900">
                    차트 보기
                </h1>
                <div className="main-governing-text mt-5">
                    시야를 넓혀 최고 수익에 도전하고 <br />
                    은퇴 전 백억 자산가가 되세요.
                </div>
                <div className="border-0 focus:ring-0 bg-transparent w-full h-full text-sm text-gray-900 dark:text-gray-300">
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
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-2 mb-5"
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
                    <div className="content-governing-text">
                        <h2>MACD(Moving Average Convergence Divergence)</h2>두 개의 이동평균선 (단기와 장기 이동평균) 사이의 차이를 나타내는 지표입니다.<br />
                        MACD 선과 신호선(9일 이동평균선)의 교차점을 분석하여 추세의 전환점을 예측할 수 있습니다.
                    </div>
                    <div className="content-governing-text">
                        <h2>Bollinger Bands(볼린저 밴드):</h2>이동평균선을 중심으로 주가의 변동 가능성을 나타내는 지표입니다.<br />
                        상한선과 하한선이 포함된 밴드로 주가가 이들 밴드 내에 있을 때는 일반적으로 안정적인 시장 상태로 판단되고, 밴드 밖으로 나갈 때는 가격의 변동 가능성이 높아진다고 해석됩니다.
                    </div>
                    <div className="content-governing-text">
                        <h2>RSI(Relative Strength Index, 상대 강도 지수)</h2> 일정기간 동안 주식의 가격 상승압력과 하락압력을 측정하는 지표입니다.<br />
                        RSI는 0에서 100 사이의 값을 가지며, 70 이상일 때는 과매수 상태로 판단되고, 30 이하일 때는 과매도 상태로 판단됩니다.
                    </div>
                    <div className="content-governing-text">
                        <h2>EMA(지수이동평균, Exponential Moving Average)</h2> 최근 가격 데이터에 더 큰 가중치를 주어 계산하는 이동평균의 한 유형입니다.<br />
                    </div>
                    <div className="content-governing-text">
                        <h2>Stochastic Oscillator(스토캐스틱 오실레이터)</h2> 주식 시장에서 가격이 일정 기간 내에서 상대적으로 어디에 위치하는지를 나타내는 기술적 지표입니다.<br />
                        이 지표는 가격이 상승하는지 하락하는지를 판단하고 과매수 및 과매도 상태를 식별하는 데 사용됩니다. <br />
                        주식의 최근 가격이 주어진 기간 동안의 최고가와 최저가 사이에서 어느 정도 위치하고 있는지를 측정합니다. <br />
                        시장의 상대적인 강도와 약점을 파악하는 데 유용하며, 주가 움직임의 반전점을 찾거나 트렌드의 지속 여부를 확인하기 위해 이 지표를 사용합니다.<br />
                    </div>

                    {stockData && (
                        <div className="mt-5 w-full h-full">
                            <ApexCharts
                                options={process.env.isDarkMode == true ? chartOptionsDark : chartOptionsLight} // 테마에 따라 차트 옵션 변경
                                series={prepareChartData()}
                                type="line"
                                height={'300px'}
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
