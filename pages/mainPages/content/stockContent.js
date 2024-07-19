import { useState, useEffect } from 'react';
import moment from 'moment';
import requestServer from './../../../components/requestServer';
import BrunnerMessageBox from '@/components/BrunnerMessageBox';

const StockContent = () => {
    const [loading, setLoading] = useState(false);
    const [modalContent, setModalContent] = useState({
        isOpen: false,
        message: '',
        onConfirm: () => { },
        onClose: () => { }
    });
    const [stocksTicker, setStocksTicker] = useState('');
    const [stockData, setStockData] = useState(null);
    const [error, setError] = useState(null);
    const [timespan, setTimespan] = useState('month');
    const [duration, setDuration] = useState(10);
    const [durationUnit, setDurationUnit] = useState('months');
    const [recentSearches, setRecentSearches] = useState([]);

    // useEffect를 사용하여 최근 검색한 종목 코드 로드
    useEffect(() => {
        const recentSearchesString = localStorage.getItem('recentSearches');
        if (recentSearchesString) {
            setRecentSearches(JSON.parse(recentSearchesString));
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
                }
            });
        });
    };

    const closeModal = () => {
        setModalContent({
            isOpen: false,
            message: '',
            onConfirm: () => { },
            onClose: () => { }
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
                limit: ''
            };

            const jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                setStockData(jResponse.stockInfo);
                // 최근 검색한 종목 코드 관리
                const updatedRecentSearches = [
                    trimmedTicker,
                    ...recentSearches.filter((item) => item !== trimmedTicker)
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

    const prepareChartData = () => {
        if (!stockData) return [];

        const data = stockData.map((item) => ({
            x: new Date(item.t),
            y: [item.o, item.h, item.l, item.c]
        }));

        return [
            {
                data: data
            }
        ];
    };

    const handleRecentSearchSelect = (selectedTicker) => {
        setStocksTicker(selectedTicker);
    };

    // window 객체가 존재할 때만 ApexCharts를 렌더링
    if (typeof window !== 'undefined') {
        const ApexCharts = require('react-apexcharts').default;

        const chartOptions = {
            chart: {
                type: 'candlestick',
                height: 350
            },
            title: {
                text: '캔들스틱 차트'
            },
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                tooltip: {
                    enabled: true
                }
            }
        };

        return (
            <>
                <BrunnerMessageBox
                    isOpen={modalContent.isOpen}
                    message={modalContent.message}
                    onConfirm={modalContent.onConfirm}
                    onClose={modalContent.onClose}
                />
                <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center my-20">
                    <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
                        차트 보기
                    </h1>
                    <div className="main-governing-text mt-5">
                        시야를 넓혀 최고 수익에 도전하고 <br />
                        은퇴 전 백억 자산가가 되세요.
                    </div>
                    <div className="border-0 focus:ring-0 bg-transparent w-full text-sm text-gray-900 dark:text-gray-300">
                        <div className="flex items-center mt-2">
                            <select
                                className="p-2 border rounded dark:text-gray-300 w-1/2"
                                value={stocksTicker}
                                onChange={(e) => setStocksTicker(e.target.value.toUpperCase())}
                            >
                                <option value="">최근 종목 코드 선택</option>
                                {recentSearches.map((ticker, index) => (
                                    <option key={index} value={ticker}>
                                        {ticker}
                                    </option>
                                ))}
                            </select>
                            <input
                                className="p-2 border rounded dark:text-gray-300 w-1/2 ml-2"
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
                            <div className="mt-5">
                                <ApexCharts
                                    options={chartOptions}
                                    series={prepareChartData()}
                                    type="candlestick"
                                    height={350}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    } else {
        // window 객체가 없는 경우 예외 처리
        return <p>차트를 불러올 수 없습니다.</p>;
    }
};

export default StockContent;