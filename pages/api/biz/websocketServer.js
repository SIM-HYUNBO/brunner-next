'use strict';

import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import logger from "./../winston/logger";

var clients = []; // 연결된 클라이언트 목록
var intervalId = null; // 타이머 ID를 저장할 변수
var currentInterval = 1000; // 초기 간격 설정 (1초)

// 타이머를 설정하는 함수
const setupInterval = (intervalDuration) => {
    // 기존 타이머를 정리
    if (intervalId) {
        clearInterval(intervalId);
    }

    // 새로운 타이머 설정
    intervalId = setInterval(() => {
        // 여기에 타이머가 호출될 때 실행할 작업
        sendStockData();
    }, intervalDuration);
};

// 타이머 간격 변경
const changeInterval = (additionalInterval) => {
    if (additionalInterval <= 0) {
        logger.error('Interval increment must be positive');
        return;
    }
    currentInterval += additionalInterval;
    logger.info(`타이머 인터벌 변경: ${currentInterval}`);
    setupInterval(currentInterval); // 타이머 재설정
};

// 서버 시작 시 타이머를 설정합니다.
setupInterval(currentInterval);

// WebSocket 신규 세션 연결
const connect = async (req, res) => {
    if (req.method === 'GET') {
        // 응답 헤더 설정
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*'); // 모든 도메인 허용
        res.setHeader('X-Accel-Buffering', 'no'); // Nginx 등의 프록시가 있을 경우 버퍼링 방지
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

        // 클라이언트가 연결을 끊었을 때
        req.on('close', () => {
            clients = clients.filter((client) => client.id !== clientId);
            logger.info(`클라이언트 연결이 끊어졌습니다. id: ${clientId}`);
        });

    } else if (req.method === 'POST') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*'); // 모든 도메인 허용
        res.setHeader('X-Accel-Buffering', 'no'); // Nginx 등의 프록시가 있을 경우 버퍼링 방지
        res.flushHeaders();

        if (req.body.type === 'subscribe') {
            if (req.body.clientId && req.body.ticker) {
                await subscribe(req.body.clientId, req.body.ticker);
                res.status(200).end();
            }
        } else if (req.body.type === 'unsubscribe') {
            if (req.body.clientId && req.body.ticker) {
                await unsubscribe(req.body.clientId, req.body.ticker);
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
                    client.subscriptions.push(ticker);
                    logger.info(`Client add new subscription: id:${clientId}, ticker:${ticker}`);
                }
            }
        });
    }
}

// 특정 구독 제거
const unsubscribe = async (clientId, ticker) => {
    if (ticker) {
        clients.forEach((client) => {
            if (client.id === clientId) {
                if (client.subscriptions.includes(ticker)) {
                    client.subscriptions = client.subscriptions.filter(t => t !== ticker);
                    logger.info(`Client remove subscription: id:${clientId}, ticker:${ticker}`);
                }
            }
        });
    }
}

// 주식 데이터 전송
const sendStockData = async () => {
    clients.forEach(async (client) => {
        for (const ticker of client.subscriptions) {
            const data = await fetchRealTimeStockData(ticker);
            if (data) {
                // 모든 연결된 클라이언트에게 데이터 전송
                data.clientId = client.id;  // 전송할 clientId를 추가해서 전송
                data.ticker = ticker;
                client.res.write(`data: ${JSON.stringify(data)}\n\n`);
                if (client.res.flush) {
                    client.res.flush();
                }
            }
        }
    });
}

// 실시간 주식 데이터 가져오기 함수
const fetchRealTimeStockData = async (ticker) => {
    try {
        const FINNHUB_REALTIME_URL = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`;
        const response = await axios.get(FINNHUB_REALTIME_URL);
        return { type: 'stockInfo', data: response.data, time: new Date(response.data.t * 1000).toISOString() };
    } catch (error) {
        logger.error('주식 데이터 가져오기 에러:', error);
        changeInterval(1000); // 예외 발생 시 타이머 간격을 1초 늘입니다.
        return null;
    }
};

export default connect;
