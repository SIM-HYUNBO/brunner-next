`use strict`

import logger from "../winston/logger"
import * as database from "./database/database"
import * as serviceSQL from './serviceSQL'

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import axios from 'axios';

const startRealtimeStockServer = (port) =>{

    if(process.isRunningRealTimeStockServer){
        return;
    }

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);
    const interval = 5000; // 5초마다 데이터 전송

    // 웹 소켓 연결 이벤트 처리
    io.on('connection', (socket) => {
        console.log('A client connected');

        // 클라이언트가 'subscribeToStock' 이벤트를 보내면 실시간 데이터 전송
        socket.on('subscribeToStock', (ticker) => {
            console.log(`Subscribed to ticker: ${ticker}`);

            // 주기적으로 데이터 전송
            const interval = setInterval(async () => {
                const stockData = await fetchRealTimeStockData(ticker);
                if (stockData) {
                    socket.emit('stockData', stockData);
                }
            }, interval); 

            // 클라이언트가 연결을 끊으면 인터벌을 청소
            socket.on('disconnect', () => {
                clearInterval(interval);
                console.log('Client disconnected');
            });
        });
    });

    server.listen(port ? port: 3001, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        process.isRunningRealTimeStockServer = true;
    });
}

// 실시간 주식 데이터 가져오기 함수
const fetchRealTimeStockData = async (ticker) => {
    try {
        const POLYGON_REALTIME_URL = `https://api.polygon.io/v2/quotes/stocks/${ticker}?apiKey=${process.env.POLYGON_API_KEY_KEY}`;
        const response = await axios.get(POLYGON_REALTIME_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return null;
    }
};

export { startRealtimeStockServer };