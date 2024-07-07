import { useState, useEffect } from 'react';
import * as userInfo from './../../../components/userInfo';
import requestServer from './../../../components/requestServer';
import BrunnerMessageBox from '@/components/BrunnerMessageBox'

const StockContent = () => {
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const [modalContent, setModalContent] = useState({
        isOpen: false,
        message: '',
        onConfirm: () => { },
        onClose: () => { }
    });

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

    const [stockSymbol, setSymbol] = useState('');
    const [stockData, setStockData] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stockSymbol) {
            setError('Please enter a stock symbol.');
            return;
        }

        setLoading(true);

        const userId = userInfo.getLoginUserId();
        if (!userId) return [];

        const jRequest = {
            commandName: 'stock.getStockInfo',
            systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
            userId: userId,
            stockSymbol: stockSymbol
        };

        setLoading(true); // 데이터 로딩 시작

        const jResponse = await requestServer('POST', JSON.stringify(jRequest));
        setLoading(false); // 데이터 로딩 시작

        if (jResponse.error_code === 0) {
            setStockData(jResponse.stockInfo);
        } else {
            openModal(jResponse.error_message);
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
                    종목코드 검색
                </h1>
                <div className="main-governing-text mt-5">
                    시야를 넓혀 최고 수익에 도전하고 <br />
                    은퇴 전 백억 자산가가 되세요.

                </div>
                <div className={`border-0 focus:ring-0 bg-transparent w-full text-sm text-gray-900 dark:text-gray-300`}>
                    <input className="p-2 border rounded dark:text-gray-300 w-full table-column"
                        type="text"
                        value={stockSymbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder="Enter stock symbol (e.g., AAPL)"
                        required
                    />
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        style={{ alignSelf: 'flex-end' }}
                    >
                        Search
                    </button>

                    {loading && <p>Loading...</p>}
                    {error && <p>{error}</p>}

                    {stockData && (
                        <div>
                            <h2>Stock Information for {stockSymbol}</h2>
                            <p>Open: {stockData['Time Series (5min)'][Object.keys(stockData['Time Series (5min)'])[0]]['1. open']}</p>
                            <p>High: {stockData['Time Series (5min)'][Object.keys(stockData['Time Series (5min)'])[0]]['2. high']}</p>
                            <p>Low: {stockData['Time Series (5min)'][Object.keys(stockData['Time Series (5min)'])[0]]['3. low']}</p>
                            <p>Close: {stockData['Time Series (5min)'][Object.keys(stockData['Time Series (5min)'])[0]]['4. close']}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StockContent;