`use strict`

import logger from "../winston/logger"
import moment from 'moment';
import * as database from "./database/database"
import * as tb_cor_sql_info from './tb_cor_sql_info'
import * as constants from '@/components/constants'
import * as requestResult from '../requestResult'

const executeService = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case constants.commands.COMMAND_STOCK_GET_TICKER_LIST:
                jResponse = await getTickerList(txnId, jRequest);
                break;
            case constants.commands.COMMAND_STOCK_GET_TICKER_INFO:
                jResponse = await getTickerInfo(txnId, jRequest);
                break;
            case constants.commands.COMMAND_STOCK_GET_STOCK_INFO:
                jResponse = await getStockInfo(txnId, jRequest);
                break;
            case constants.commands.COMMAND_STOCK_GET_LATEST_STOCK_INFO:
                jResponse = await getLatestStockInfo(txnId, jRequest);
                break;
            case constants.commands.COMMAND_STOCK_GET_REALTIME_STOCK_INFO:
                jResponse = await getRealtimeStockInfo(txnId, jRequest);
                break;
            case constants.commands.COMMAND_STOCK_GET_CURRENCY_LIST:
                jResponse = await getCurrencyList(txnId, jRequest);
                break;
            case constants.commands.COMMAND_STOCK_GET_EXCHANGE_BY_CURRENCY:
                jResponse = await getExchangeByCurrency(txnId, jRequest);
                break;
            default:
                break;
        }
    } catch (error) {
        logger.error(`message:${error.message}\n stack:${error.stack}\n`);
    } finally {
        return jResponse;
    }
}

var recentSearch_getTickerList = null;
var recentSearch_getTickerInfo = new Map();
var recentSearch_getRealtimeStockInfo = new Map();


const getStockInfo = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.userId = jRequest.userId;

        if (!jRequest.tickerCode) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [tickerCode]`;
            return jResponse;
        }

        if (!jRequest.multiplier) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [multiplier]`;
            return jResponse;
        }

        if (!jRequest.timespan) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [timespan]`;
            return jResponse;
        }

        if (!jRequest.from) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [from]`;
            return jResponse;
        }

        if (!jRequest.to) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [to]`;
            return jResponse;
        }

        if (!jRequest.adjust) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [adjust]`;
            return jResponse;
        }

        if (!jRequest.sort) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [sort]`;
            return jResponse;
        }

        var searchFlag = true; // 지금 조회를 해야 하는지 여부

        var recentRequestResult = await requestResult.getRequestResult(jRequest.systemCode, constants.commands.COMMAND_STOCK_GET_STOCK_INFO, jRequest.tickerCode, jRequest.multiplier, jRequest.timespan, jRequest.from, jRequest.to, jRequest.adjust, jRequest.sort, '', '', '')
        if (recentRequestResult) {
            searchFlag = false;
            jResponse.stockInfo = JSON.parse(recentRequestResult);

            jResponse.error_code = 0; // exception
            jResponse.error_message = constants.messages.EMPTY_STRING;
        }

        if (searchFlag) { // 지금 조회를 해야 한다면
            const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${jRequest.tickerCode}/range/${jRequest.multiplier}/${jRequest.timespan}/${jRequest.from}/${jRequest.to}?adjusted=${jRequest.adjust}&sort=${jRequest.sort}&apiKey=${process.env.POLYGON_API_KEY}`

            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw Error(response.statusText)
            }

            const data = await response.json();
            if (data.results) {
                data.results.map((d) => {
                    d.t = d.t / 1000;
                });
                jResponse.stockInfo = data.results;

                await requestResult.saveRequestResult(jRequest.systemCode, constants.commands.COMMAND_STOCK_GET_STOCK_INFO, jRequest.tickerCode, jRequest.multiplier, jRequest.timespan, jRequest.from, jRequest.to, jRequest.adjust, jRequest.sort, '', '', '', JSON.stringify(data.results))

                jResponse.error_code = 0; // exception
                jResponse.error_message = constants.messages.EMPTY_STRING;
            }
            else {
                jResponse.error_code = -1; // exception
                jResponse.error_message = data.status;
            }
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

        var searchFlag = true; // 지금 조회를 해야 하는지 여부
        if (recentSearch_getTickerList != null) { // 최근 조회이력이 있고
            const diffDay = (new Date() - recentSearch_getTickerList.searchTime) / (24 * 60 * 60 * 1000);
            if (diffDay < 1) { // 조회한지 하루가 지나지 않은 경우
                searchFlag = false; // 조회하지 않고 최근 조회결과로 리턴
            }
        }

        if (searchFlag) { // 지금 조회를 해야 한다면
            var sql = null
            sql = await tb_cor_sql_info.getSQL00('select_TB_COR_TICKER_INFO', 1);
            var select_TB_COR_TICKER_INFO_01 = await database.executeSQL(sql,
                [
                    jRequest.systemCode
                ]);

            jResponse.tickerList = select_TB_COR_TICKER_INFO_01.rows;

            recentSearch_getTickerList = {};
            recentSearch_getTickerList.searchTime = new Date();
            recentSearch_getTickerList.searchData = jResponse.tickerList;
        }
        else {
            jResponse.tickerList = recentSearch_getTickerList.searchData;
        }

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING;
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

        var searchFlag = true; // 지금 조회를 해야 하는지 여부
        if (recentSearch_getTickerInfo != null && recentSearch_getTickerInfo.has(jRequest.systemCode + '_' + jRequest.tickerCode)) { // 최근 조회이력이 있고
            const diffDay = (new Date() - recentSearch_getTickerInfo.get(jRequest.systemCode + '_' + jRequest.tickerCode).searchTime) / (24 * 60 * 60 * 1000);
            if (diffDay < 1) { // 조회한지 하루가 지나지 않은 경우
                searchFlag = false; // 조회하지 않고 최근 조회결과로 리턴
            }
        }

        if (searchFlag) { // 지금 조회를 해야 한다면        

            var sql = null
            sql = await tb_cor_sql_info.getSQL00('select_TB_COR_TICKER_INFO', 2);
            var select_TB_COR_TICKER_INFO_02 = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    jRequest.tickerCode,
                ]);

            if (select_TB_COR_TICKER_INFO_02.rowCount === 1) {
                logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_TICKER_INFO_02.rows[0])}\n`);

                jResponse.tickerInfo = {}; 5
                jResponse.tickerInfo.tickerDesc = select_TB_COR_TICKER_INFO_02.rows[0].ticker_desc;
            }
            else if (select_TB_COR_TICKER_INFO_02.rowCount <= 0) {
                jResponse.error_code = -1;
                jResponse.error_message = `The ticker info not exist.`;
                return jResponse;
            }

            // ticker별 최신 news 조회 url은 https://api.polygon.io/v2/reference/news?ticker=TICKER_SYMBOL&apiKey=YOUR_API_KEY
            // 무료가 아니므로 못함

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
                    jResponse.tickerInfo.tickerInfoContent = data.results;
                    jResponse.tickerInfo.searchTime = new Date();
                    recentSearch_getTickerInfo.set(jRequest.systemCode + '_' + jRequest.tickerCode, jResponse.tickerInfo);

                    jResponse.error_code = 0; // exception
                    jResponse.error_message = data.status;
                }
                else {
                    jResponse.error_code = -1; // exception
                    jResponse.error_message = data.status;
                }
            }
        }
        else {
            jResponse.tickerInfo = recentSearch_getTickerInfo.get(jRequest.systemCode + '_' + jRequest.tickerCode);
            jResponse.error_code = 0; // exception
            jResponse.error_message = '';
        }

        jResponse.apikey = process.env.POLYGON_API_KEY;
        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING;
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const getLatestStockInfo = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.userId = jRequest.userId;

        if (!jRequest.tickerCode) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [tickerCode]`;
            return jResponse;
        }
        if (!jRequest.dataCount) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [dataCount]`;
            return jResponse;
        }
        const from = moment().subtract(5, "day").format('YYYY-MM-DD')
        const to = moment().format('YYYY-MM-DD');

        var searchFlag = true; // 지금 조회를 해야 하는지 여부

        var recentRequestResult = await requestResult.getRequestResult(jRequest.systemCode, constants.commands.COMMAND_STOCK_GET_LATEST_STOCK_INFO, jRequest.tickerCode, '', '', from, to, '', '', '', '', '')

        var data = null;
        if (recentRequestResult) {
            searchFlag = false;
        }

        if (searchFlag) { // 지금 조회를 해야 한다면        
            const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${jRequest.tickerCode}/range/1/minute/${from}/${to}?adjusted=true&sort=asc&apiKey=${process.env.POLYGON_API_KEY}`

            const response = await fetch(apiUrl);
            if (!response.ok) {
                jResponse.error_code = response.status;
                jResponse.error_message = response.statusText;
                return jResponse;
            }

            data = await response.json();
            if (data.results) {
                await requestResult.saveRequestResult(jRequest.systemCode, constants.commands.COMMAND_STOCK_GET_LATEST_STOCK_INFO, jRequest.tickerCode, '', '', from, to, '', '', '', '', '', data)

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
        else {
            data = JSON.parse(recentRequestResult);
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
        await requestResult.deleteRequestResult(jRequest.systemCode, to)
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

        if (!jRequest.systemCode) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [systemCode]`;

            return jResponse;
        }

        if (!jRequest.tickerCode) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [tickerCode]`;

            return jResponse;
        }

        var searchFlag = true; // 지금 조회를 해야 하는지 여부
        if (recentSearch_getRealtimeStockInfo != null && recentSearch_getRealtimeStockInfo.has(jRequest.systemCode + '_' + jRequest.tickerCode)) { // 최근 조회이력이 있고
            const diffDay = (new Date() - recentSearch_getRealtimeStockInfo.get(jRequest.systemCode + '_' + jRequest.tickerCode).searchTime) / (24 * 60 * 60 * 1000);
            if (diffDay * 24 * 60 < 1) { // 조회한지 1분이 지나지 않은 경우
                searchFlag = false; // 조회하지 않고 최근 조회결과로 리턴
            }
        }

        if (searchFlag) { // 지금 조회를 해야 한다면   

            const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${jRequest.tickerCode}&token=${process.env.FINNHUB_API_KEY}`;
            response = await fetch(apiUrl);
            if (!response.ok) {
                throw Error(response.statusText)
            }

            const data = await response.json();
            jResponse.stockInfo = { type: 'stockInfo', data: data, time: new Date(data.t * 1000).toISOString() }
            jResponse.stockInfo.searchTime = new Date();
            recentSearch_getRealtimeStockInfo.set(jRequest.systemCode + '_' + jRequest.tickerCode, jResponse.stockInfo);
        }
        else {
            jResponse.stockInfo = recentSearch_getRealtimeStockInfo.get(jRequest.systemCode + '_' + jRequest.tickerCode);
        }

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING;
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

const getCurrencyList = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.systemCode = jRequest.systemCode;

        var sql = null
        sql = await tb_cor_sql_info.getSQL00('select_TB_COR_CURRENCY_MST', 1);
        var select_TB_COR_CURRENCY_MST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode
            ]);

        jResponse.currencyList = select_TB_COR_CURRENCY_MST_01.rows;
        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING;
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const getExchangeByCurrency = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.currencyCode = jRequest.currencyCode;

        const apiUrl = `https://api.exchangerate-api.com/v4/latest/${jRequest.currencyCode}`;
        const res = await fetch(apiUrl);
        if (!res.ok) {
            jResponse.error_code = -1;
            jResponse.error_message = `Failed to fetch exchange rate data for ${jRequest.currencyCode}`;
        }
        else {
            const data = await res.json();
            jResponse.exchangeRate = data.rates;
            jResponse.base = data.base;

            jResponse.error_code = 0;
            jResponse.error_message = constants.messages.EMPTY_STRING;
        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

export { executeService };