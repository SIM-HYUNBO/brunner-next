import dotenv from 'dotenv';
import { useState, useEffect } from 'react';
import moment from 'moment';
import requestServer from './../../../components/requestServer';
import BrunnerMessageBox from '@/components/BrunnerMessageBox';
import dynamic from 'next/dynamic';
import Select from 'react-select';
import { format } from 'winston';

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
    const [stockData, setStockData] = useState(null); // 주식 데이터
    const [error, setError] = useState(null); // 에러 메시지
    const [timespan, setTimespan] = useState('hour'); // 데이터의 시간 범위
    const [duration, setDuration] = useState(15); // 기간
    const [durationUnit, setDurationUnit] = useState('days'); // 기간 단위
    const [recentSearches, setRecentSearches] = useState([]); // 최근 검색 기록
    const [defaultTicker, setDefaultTicker] = useState(''); // 기본 심볼
    const [selectedOption, setSelectedOption] = useState(null); // 선택된 옵션

    // useEffect를 사용하여 최근 검색한 종목 코드 로드
    useEffect(() => {
        const storedSearches = localStorage.getItem('recentSearches');
        if (storedSearches) {
            setRecentSearches(JSON.parse(storedSearches));
        }

        const defaultTicker = localStorage.getItem('defaultTicker');
        if (defaultTicker) {
            setDefaultTicker(defaultTicker);
            setStocksTicker(defaultTicker);
        }
    }, []);

    // 주식 심볼 옵션
    const stockOptions = [
        { value: 'AAPL', label: 'Apple' },
        { value: 'GOOGL', label: 'Google' },
        { value: 'AMZN', label: 'Amazon' },
        { value: 'MSFT', label: 'Microsoft' },
        { value: 'TSLA', label: 'Tesla' },
    ];

    // 주식 데이터를 가져오는 함수
    const fetchStockData = async () => {
        setLoading(true);
        try {
            const timefrom = moment().subtract(duration, durationUnit).format('YYYY-MM-DD');
            const timeto = moment().format('YYYY-MM-DD');

            const jRequest = {
                commandName: 'stock.getStockInfo',
                systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
                stocksTicker: stocksTicker,
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
                setError(null);

                // 최근 검색 기록 업데이트
                const newSearch = { value: stocksTicker, label: stocksTicker };
                const updatedSearches = [
                    newSearch,
                    ...recentSearches.filter((s) => s.value !== stocksTicker),
                ].slice(0, 5); // 최대 5개까지 저장
                setRecentSearches(updatedSearches);
                localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
            } else {
                setError(res.message || '데이터를 불러오는 중 오류가 발생했습니다.');
            }
        } catch (err) {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
        setLoading(false);
    };

    // 주식 데이터 요청 처리
    const handleStockRequest = (event) => {
        event.preventDefault();
        if (!stocksTicker) {
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

    // 데이터 가져오기 버튼 클릭 핸들러
    const handleFetchClick = async () => {
        setLoading(true);
        try {
            const result = await requestServer('/api/stocks', 'GET', {
                ticker: stocksTicker,
                timespan,
                duration,
                durationUnit,
            });

            if (result.success) {
                setStockData(result.data);
                setError(null);

                // 최근 검색 기록 업데이트
                const updatedSearches = [...recentSearches];
                const existingIndex = updatedSearches.findIndex(
                    (item) => item.value === stocksTicker
                );
                if (existingIndex !== -1) {
                    updatedSearches.splice(existingIndex, 1);
                }
                updatedSearches.unshift({ value: stocksTicker, label: stocksTicker });
                if (updatedSearches.length > 5) {
                    updatedSearches.pop();
                }
                setRecentSearches(updatedSearches);
                localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
            } else {
                setError(result.message || '데이터를 불러오는 중 오류가 발생했습니다.');
            }
        } catch (err) {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
        setLoading(false);
    };

    // 기본 티커 설정
    useEffect(() => {
        const storedTicker = localStorage.getItem('defaultTicker');
        if (storedTicker) {
            setDefaultTicker(storedTicker);
            setStocksTicker(storedTicker);
        }
    }, []);

    // 티커 선택 시 기본 티커 업데이트
    const handleTickerChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        setStocksTicker(selectedOption ? selectedOption.value : '');
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
            title: {
                text: `${stocksTicker} 주식 차트`,
                align: 'left',
            },
            xaxis: {
                type: 'datetime',
            },
            yaxis:{
                labels:{
                    formatter: function(val){
                        return val.toFixed();
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
        };

        const rsiOptions = {
            chart: {
                type: 'line',
                height: 150,
                zoom: {
                    enabled: false,
                },
            },
            title: {
                text: 'RSI',
                align: 'left',
            },
            xaxis: {
                type: 'datetime',
            },
            yaxis:{
                labels:{
                    formatter: function(val){
                        return val.toFixed();
                    }
                }
            },
            series: [
                {
                    name: 'RSI',
                    data: rsi,
                },
            ],
        };

        const macdOptions = {
            chart: {
                type: 'line',
                height: 150,
                zoom: {
                    enabled: false,
                },
            },
            title: {
                text: 'MACD',
                align: 'left',
            },
            xaxis: {
                type: 'datetime',
            },
            yaxis:{
                labels:{
                    formatter: function(val){
                        return val.toFixed();
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
        };

        const bollingerOptions = {
            chart: {
                type: 'line',
                height: 350,
                zoom: {
                    enabled: true,
                },
            },
            title: {
                text: 'Bollinger Bands',
                align: 'left',
            },
            xaxis: {
                type: 'datetime',
            },
            yaxis:{
                labels:{
                    formatter: function(val){
                        return val.toFixed();
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
        };

        return (
            <div>
                <ApexCharts options={chartOptions} series={chartOptions.series} type="line" height={350} />
                <ApexCharts options={rsiOptions} series={rsiOptions.series} type="line" height={150} />
                <ApexCharts options={macdOptions} series={macdOptions.series} type="line" height={150} />
                <ApexCharts options={bollingerOptions} series={bollingerOptions.series} type="line" height={350} />
            </div>
        );
    };

    return (
        <div>
            <form onSubmit={handleStockRequest}>
                <label>
                    주식 심볼:
                    <input
                        type="text"
                        value={stocksTicker}
                        onChange={(e) => setStocksTicker(e.target.value)}
                    />
                </label>
                <button type="submit">데이터 가져오기</button>
            </form>

            <Select
                value={selectedOption}
                onChange={handleTickerChange}
                options={stockOptions}
                placeholder="주식 심볼 선택"
                isClearable
                styles={{
                    container: (provided) => ({
                        ...provided,
                        marginTop: '1em',
                        marginBottom: '1em',
                    }),
                }}
            />

            <div>
                <label>
                    시간 범위:
                    <select value={timespan} onChange={(e) => setTimespan(e.target.value)}>
                        <option value="minute">분</option>
                        <option value="hour">시간</option>
                        <option value="day">일</option>
                    </select>
                </label>
                <label>
                    기간:
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        min="1"
                    />
                </label>
                <label>
                    기간 단위:
                    <select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value)}>
                        <option value="days">일</option>
                        <option value="weeks">주</option>
                        <option value="months">월</option>
                    </select>
                </label>
            </div>

            {loading && <p>데이터 로딩 중...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {stockData && renderChart()}

            <BrunnerMessageBox
                isOpen={modalContent.isOpen}
                message={modalContent.message}
                onConfirm={modalContent.onConfirm}
                onClose={modalContent.onClose}
            />
        </div>
    );
};

export default StockContent;