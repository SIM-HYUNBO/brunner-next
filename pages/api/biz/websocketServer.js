`use strict`

import logger from "./../winston/logger"
import { v4 as uuidv4 } from 'uuid';

let clients = []; // 연결된 클라이언트 목록
const interval = 5000; // 5초마다 데이터 전송

// WebSocket 신규 세션 연결
const connect = async (req, res) => {
    if (req.method === 'GET') {
        // 응답 헤더 설정
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const clientId = uuidv4(); // 고유한 클라이언트 ID 생성

        // 클라이언트 목록에 추가
        const client = {
            id: clientId,
            subscriptions: [],
            res: res
        };
        clients.push(client);
        logger.info(`A New Client added:  \n${JSON.stringify(client.id)}\n`);

        await replySessionInfo(clientId, res);

        // interval미다 데이터 전송 등록
        const intervalId = setInterval(sendStockData, interval);

        // 클라이언트가 연결을 끊었을 때 인터벌 정리
        req.on('close', () => {
            clearInterval(intervalId);
            logger.info(`Client connection closed`);
        });

        // 클라이언트가 연결을 끊었을 때
        req.on('close', () => {
            clients = clients.filter((client) => client.id !== clientId);
            logger.info(`클라이언트 연결이 끊어졌습니다. id: ${clientId}`);
        });
    } else if (req.method === 'POST') {
        if (req.body.type === 'subscribe') {
            if (req.body.clientId && req.body.ticker) {
                await subscribe(req.body.clientId, req.body.ticker);
                res.status(200).end();
            }
        }
    } else {
        res.status(405).end(); // 다른 요청 메소드는 허용하지 않음
    }
};

// 세션 아이디 회신
const replySessionInfo = async (clientId, res) => {
    const data = {
        'type': 'sessionInfo',
        'clientId': clientId
    };

    if (data) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        if (res.flush) {
            res.flush();
        }
    }
};

// 구독 추가
const subscribe = async (clientId, ticker) => {
    if (ticker) {
        clients.forEach((client) => {
            if (client.id === clientId) {
                if (!client.subscriptions.includes(ticker)) {
                    client.subscriptions.length = 0;
                    client.subscriptions.push(ticker);

                    logger.info(`Client add new subscription: id:${clientId}, ticker:${ticker}`);
                }
            }
        })
    }
}

// 특정 구독 제거
const unsubscribe = async (clientId, ticker) => {
    if (ticker) {
        clients.forEach((client) => {
            if (client.id === clientId) {
                if (client.subscriptions.includes(ticker)) {
                    client.subscriptions.pop(ticker);
                    logger.info(`Client remove subscription: id:${clientId}, ticker:${ticker}`);
                }
            }
        })
    }
}

//  구독 모두 제거
const unsubscribeAllStockTickers = async (clientId) => {
    clients.forEach((client) => {
        if (client.id === clientId) {
            if (client.subscriptions.includes(ticker)) {
                client.subscriptions.length = 0;
                logger.info(`Client clear subscription: id:${clientId}`);
            }
        }
    });
}

// 주식 데이터 전송
const sendStockData = () => {
    clients.forEach((client) => {
        client.subscriptions.forEach(async (ticker) => {
            const data = await fetchRealTimeStockData(ticker);

            // 모든 연결된 클라이언트에게 데이터 전송
            data.clientId = client.id;  // 전송할 clientId를 추가해서 전송
            client.res.write(`data: ${JSON.stringify(data)}\n\n`);
            if (client.res.flush) {
                client.res.flush();
            }
        })
    });
}


// 실시간 주식 데이터 가져오기 함수
const fetchRealTimeStockData = async (ticker) => {
    try {
        process.env.FINNHUB_API_KEY = 'cqlk3cpr01qo3h6tj30gcqlk3cpr01qo3h6tj310';
        const FINNHUB_REALTIME_URL = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}

        const response = await axios.get(FINNHUB_REALTIME_URL); // {"c":82.58,"d":-0.22,"dp":-0.2657,"h":83.19,"l":82.43,"o":82.95,"pc":82.8,"t":1722456000}
        return { type: 'stockInfo', data: response, time: new Date().toISOString() };
    } catch (error) {
        console.error('주식 데이터 가져오기 에러:', error);
        return null;
    }
};

export default connect;
