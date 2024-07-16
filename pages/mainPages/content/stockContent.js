import { useState } from 'react';
import moment from 'moment';
import * as userInfo from './../../../components/userInfo';
import requestServer from './../../../components/requestServer';
import BrunnerMessageBox from '@/components/BrunnerMessageBox';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const StockContent = () => {
    const [loading, setLoading] = useState(false);
    const [modalContent, setModalContent] = useState({
        isOpen: false,
        message: '',
        onConfirm: () => {},
        onClose: () => {}
    });
    const [stocksTicker, setStocksTicker] = useState('');
    const [stockData, setStockData] = useState(null);
    const [error, setError] = useState(null);

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

    const closeModal = () => {
        setModalContent({
            isOpen: false,
            message: '',
            onConfirm: () => {},
            onClose: () => {}
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedTicker = stocksTicker.trim();
        if (!trimmedTicker) {
            setError('주식 심볼을 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const jRequest = {
                commandName: 'stock.getStockInfo',
                systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
                stocksTicker: trimmedTicker,
                multiplier: 1,
                timespan: "day",
                from: moment().startOf('isoWeek').subtract(365, 'days').format("YYYY-MM-DD"),
                to: moment().endOf('week').format('YYYY-MM-DD'),
                adjust: true,
                sort: "desc",
                limit: ""
            };

            const jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                setStockData(jResponse.stockInfo);
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

    const getDateTimeFromUnixTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleDateString(); // 날짜만 반환
    };

    const prepareChartData = () => {
        if (!stockData) return { labels: [], datasets: [] };
        
        const labels = stockData.map(item => getDateTimeFromUnixTimestamp(item.t));
        const prices = stockData.map(item => item.c); // 종가

        return {
            labels: labels,
            datasets: [
                {
                    label: '종가',
                    data: prices,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                type: 'category',
                reverse: true,  // X축을 반전시켜 오른쪽이 나중에 나오도록 설정
                title: {
                    display: true,
                    text: '날짜'
                }
            },
            y: {
                title: {
                    display: true,
                    text: '종가'
                }
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
                    주간 종목 검색
                </h1>
                <div className="main-governing-text mt-5">
                    시야를 넓혀 최고 수익에 도전하고 <br />
                    은퇴 전 백억 자산가가 되세요.
                </div>
                <div className="border-0 focus:ring-0 bg-transparent w-full text-sm text-gray-900 dark:text-gray-300">
                    <input
                        className="p-2 border rounded dark:text-gray-300 w-full table-column"
                        type="text"
                        value={stocksTicker}
                        onChange={(e) => setStocksTicker(e.target.value.toUpperCase())}
                        placeholder="주식 심볼 입력 (예: AAPL)"
                        required
                    />
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        style={{ alignSelf: 'flex-end' }}
                        disabled={loading}
                    >
                        검색
                    </button>

                    {loading && <p>로딩 중...</p>}
                    {error && <p>{error}</p>}

                    {stockData && (
                        <div className="mt-5">
                            <Line data={prepareChartData()} options={chartOptions} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StockContent;