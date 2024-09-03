`use strict`

import logger from "./../winston/logger"
import * as database from "./database/database"
import * as serviceSQL from './serviceSQL'
import axios from 'axios';
import moment from 'moment';
import * as Constants from '@/components/constants'

const executeService = (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case Constants.COMMAND_STOCK_GET_TICKER_LIST:
                jResponse = getTickerList(txnId, jRequest);
                break;
            case Constants.COMMAND_STOCK_GET_TICKER_INFO:
                jResponse = getTickerInfo(txnId, jRequest);
                break;
            case Constants.COMMAND_STOCK_GET_STOCK_INFO:
                jResponse = getStockInfo(txnId, jRequest);
                break;
            case Constants.COMMAND_STOCK_GET_LATEST_STOCK_INFO:
                jResponse = getLatestStockInfo(txnId, jRequest);
                break;
            case Constants.COMMAND_STOCK_GET_REALTIME_STOCK_INFO:
                jResponse = getRealtimeStockInfo(txnId, jRequest);
                break;
            default:
                break;
        }
    } catch (error) {
        logger.error(error);
    } finally {
        return jResponse;
    }
}

const getStockInfo = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.userId = jRequest.userId;

        if (!jRequest.stocksTicker) {
            jResponse.error_code = -2;
            jResponse.error_message = `${Constants.MESSAGE_REQUIRED_FIELD} [stocksTicker]`;
            return jResponse;
        }

        if (!jRequest.multiplier) {
            jResponse.error_code = -2;
            jResponse.error_message = `${Constants.MESSAGE_REQUIRED_FIELD} [multiplier]`;
            return jResponse;
        }

        if (!jRequest.timespan) {
            jResponse.error_code = -2;
            jResponse.error_message = `${Constants.MESSAGE_REQUIRED_FIELD} [timespan]`;
            return jResponse;
        }

        if (!jRequest.from) {
            jResponse.error_code = -2;
            jResponse.error_message = `${Constants.MESSAGE_REQUIRED_FIELD} [from]`;
            return jResponse;
        }

        if (!jRequest.to) {
            jResponse.error_code = -2;
            jResponse.error_message = `${Constants.MESSAGE_REQUIRED_FIELD} [to]`;
            return jResponse;
        }

        if (!jRequest.adjust) {
            jResponse.error_code = -2;
            jResponse.error_message = `${Constants.MESSAGE_REQUIRED_FIELD} [adjust]`;
            return jResponse;
        }

        if (!jRequest.sort) {
            jResponse.error_code = -2;
            jResponse.error_message = `${Constants.MESSAGE_REQUIRED_FIELD} [sort]`;
            return jResponse;
        }

        const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${jRequest.stocksTicker}/range/${jRequest.multiplier}/${jRequest.timespan}/${jRequest.from}/${jRequest.to}?adjusted=${jRequest.adjust}&sort=${jRequest.sort}&apiKey=${process.env.POLYGON_API_KEY}`

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw Error(response.statusText)
        }

        const data = await response.json();
        jResponse.stockInfo = data.results;

        if (data.results) {
            jResponse.error_code = 0; // exception
            jResponse.error_message = Constants.EMPTY_STRING;

            data.results.map((d) => {
                d.t = d.t / 1000;
            });
        }
        else {
            jResponse.error_code = -1; // exception
            jResponse.error_message = data.status;
        }
    }
    catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    }
    finally {
        return jResponse;
    }
};


const getTickerList = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await serviceSQL.getSQL00('select_TB_COR_TICKER_INFO', 1);
        var select_TB_COR_TICKER_INFO_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode
            ]);

        jResponse.tickerList = select_TB_COR_TICKER_INFO_01.rows;

        jResponse.error_code = 0;
        jResponse.error_message = Constants.EMPTY_STRING;
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const getTickerInfo = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await serviceSQL.getSQL00('select_TB_COR_TICKER_INFO', 2);
        var select_TB_COR_TICKER_INFO_02 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.tickerCode,
            ]);

        if (select_TB_COR_TICKER_INFO_02.rowCount === 1) {
            logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_TICKER_INFO_02.rows[0])}\n`);

            jResponse.tickerInfo = {};
            jResponse.tickerInfo.tickerDesc = select_TB_COR_TICKER_INFO_02.rows[0].ticker_desc;
        }
        else if (select_TB_COR_TICKER_INFO_02.rowCount <= 0) {
            jResponse.error_code = -1;
            jResponse.error_message = `The ticker info not exist.`;
            return jResponse;
        }

        // ticker 최신 news 조회
        const apiUrl = `https://api.polygon.io/v3/reference/tickers/${jRequest.tickerCode}?apiKey=${process.env.POLYGON_API_KEY}`
        const response = await fetch(apiUrl);
        if (!response.ok) {
            jResponse.error_code = response.status;
            jResponse.error_message = response.statusText;
            return jResponse;
        }
        else {
            const data = await response.json();
            if (data.results) {
                jResponse.tickerInfo.tickerNewsContent = convertJsonToPlainText(data.results);
                jResponse.error_code = 0; // exception
                jResponse.error_message = data.status;
            }
            else {
                jResponse.error_code = -1; // exception
                jResponse.error_message = data.status;
            }
        }

        jResponse.error_code = 0;
        jResponse.error_message = Constants.EMPTY_STRING;
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

function convertJsonToPlainText(jsonObject) {
    return Object.entries(jsonObject)
        .map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                // 객체 값을 문자열로 변환하고 콤마와 따옴표를 제거
                const formattedObject = JSON.stringify(value, null, 2)
                    .replace(/"([^"]+)":/g, '$1:') // 키의 따옴표 제거
                    .replace(/"([^"]+)"/g, '$1')   // 값의 따옴표 제거
                    .replace(/,\s*([\]}])/g, '$1') // 마지막 콤마 제거
                    .replace(/^\{\n/, '')          // 시작 중괄호 및 줄바꿈 제거
                    .replace(/\n\}$/, '');         // 마지막 중괄호 및 줄바꿈 제거
                return `${key}: \n${formattedObject}`;
            }
            return `${key}: ${value}`;
        })
        .join('\n'); // 항목 간에 줄바꿈을 두 번 추가하여 구분
}

const getLatestStockInfo = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.userId = jRequest.userId;

        if (!jRequest.stocksTicker) {
            jResponse.error_code = -2;
            jResponse.error_message = `${Constants.MESSAGE_REQUIRED_FIELD} [stocksTicker]`;
            return jResponse;
        }
        if (!jRequest.dataCount) {
            jResponse.error_code = -2;
            jResponse.error_message = `${Constants.MESSAGE_REQUIRED_FIELD} [dataCount]`;
            return jResponse;
        }

        const from = moment().subtract(5, "day").format('YYYY-MM-DD')
        const to = moment().format('YYYY-MM-DD');
        const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${jRequest.stocksTicker}/range/1/minute/${from}/${to}?adjusted=true&sort=asc&apiKey=${process.env.POLYGON_API_KEY}`

        const response = await fetch(apiUrl);
        if (!response.ok) {
            jResponse.error_code = response.status;
            jResponse.error_message = response.statusText;
            return jResponse;
        }

        const data = await response.json();
        if (data.results) {
            jResponse.stockInfo = data.results.slice(jRequest.dataCount);
            jResponse.stockInfo.map((d) => {
                d.t = d.t / 1000; // 시간의 단위는 초로
            });
            jResponse.error_code = 0; // exception
            jResponse.error_message = data.status;
        }
        else {
            jResponse.error_code = -1; // exception
            jResponse.error_message = data.status;
        }
    }
    catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    }
    finally {
        return jResponse;
    }
};

const getRealtimeStockInfo = async (txnId, jRequest) => {
    var jResponse = {};
    var response = null;
    try {
        jResponse.commanaName = jRequest.commandName;

        if (!jRequest.stocksTicker) {
            jResponse.error_code = -2;
            jResponse.error_message = `${Constants.MESSAGE_REQUIRED_FIELD} [stocksTicker]`;

            return jResponse;
        }

        const FINNHUB_REALTIME_URL = `https://finnhub.io/api/v1/quote?symbol=${jRequest.stocksTicker}&token=${process.env.FINNHUB_API_KEY}`;
        response = await axios.get(FINNHUB_REALTIME_URL);
        if (response.status !== 200) {
            throw Error(response.statusText)
        }
        jResponse.stockInfo = { type: 'stockInfo', data: response.data, time: new Date(response.data.t * 1000).toISOString() }
        jResponse.error_code = 0;
        jResponse.error_message = Constants.EMPTY_STRING;
    }
    catch (e) {
        logger.error(e);
        jResponse.error_code = e.response.status;
        jResponse.error_message = e.response.statusText;
    }
    finally {
        return jResponse;
    }
};

export { executeService };