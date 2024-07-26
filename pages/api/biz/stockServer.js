import axios from 'axios';

let clients = []; // 연결된 클라이언트 목록

// 실시간 주식 데이터 가져오기 함수
const fetchRealTimeStockData = async (ticker) => {
    try {
        // 이 API는 무료사용이 아님, 에러 메시지 확인
        const POLYGON_REALTIME_URL = `https://api.polygon.io/v3/quotes/${ticker}?limit=1&apiKey=${process.env.POLYGON_API_KEY}`;
        const response = await axios.get(POLYGON_REALTIME_URL);
        return response.data;
    } catch (error) {
        console.error('주식 데이터 가져오기 에러:', error);
        return null;
    }
};

// WebSocket 연결 처리 함수
const handleSocketConnection = async (req, res) => {
    if (req.method === 'GET') {
        // 응답 헤더 설정
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const clientId = Date.now(); // 고유한 클라이언트 ID 생성
        clients.push({ id: clientId, res }); // 클라이언트 목록에 추가

        // 클라이언트가 연결을 끊었을 때
        req.on('close', () => {
            clients = clients.filter((client) => client.id !== clientId);
            console.log(`클라이언트 연결이 끊어졌습니다. ID: ${clientId}`);
        });
    } else {
        res.status(405).end(); // 다른 요청 메소드는 허용하지 않음
    }
};

// 주식 데이터 전송
const sendStockData = async (ticker) => {
    const stockData = await fetchRealTimeStockData(ticker);
    if (stockData) {
        // 모든 연결된 클라이언트에게 데이터 전송
        clients.forEach((client) =>
            client.res.write(`data: ${JSON.stringify(stockData)}\n\n`)
        );
    }
};

// 주기적으로 주식 데이터를 가져와 전송
const interval = 5000; // 5초마다 데이터 전송
let ticker = 'AAPL'; // 기본 구독 티커 (예: 애플 주식)

setInterval(() => {
    sendStockData(ticker);
}, interval);

export default handleSocketConnection;
