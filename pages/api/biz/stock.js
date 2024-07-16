`use strict`

import logger from "./../winston/logger"
import * as database from "./database/database"
import * as serviceSQL from './serviceSQL'

export default function executeService(txnId, jRequest) {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case "stock.getStockInfo":
                jResponse = getStockInfo(txnId, jRequest);
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

        // if (!jRequest.userId) {
        //     jResponse.error_code = -2;
        //     jResponse.error_message = `The [userId] is a required field. 
        //     Please enter a value.`;
        //     return jResponse;
        // }

        if (!jRequest.stocksTicker) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [stocksTicker] is a required field. 
            Please set a value.`;
            return jResponse;
        }

        if (!jRequest.multiplier) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [multiplier] is a required field. 
            Please set a value.`;
            return jResponse;
        }

        if (!jRequest.timespan) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [timespan] is a required field. 
            Please set a value.`;
            return jResponse;
        }

        if (!jRequest.from) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [from] is a required field. 
            Please set a value.`;
            return jResponse;
        }

        if (!jRequest.to) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [to] is a required field. 
            Please set a value.`;
            return jResponse;
        }

        if (!jRequest.adjust) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [adjust] is a required field. 
            Please set a value.`;
            return jResponse;
        }

        if (!jRequest.sort) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [sort] is a required field. 
            Please set a value.`;
            return jResponse;
        }

        const apiKey = 'oTwT_PvBEuiPDqCkdKsPf66VQdNSKLGR'; // 무료 api key는 제약사항이 많음. 1일 25번만 요청 가능 등
        const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${jRequest.stocksTicker}/range/${jRequest.multiplier}/${jRequest.timespan}/${jRequest.from}/${jRequest.to}?adjusted=${jRequest.adjust}&sort=${jRequest.sort}&apiKey=${apiKey}`

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw Error(response.statusText)
        }

        const data = await response.json();
        jResponse.stockInfo = data.results;
        jResponse.error_code = 0; // exception
        jResponse.error_message = data.status;
    }
    catch (e) {
        logger.error(`EXCEPTION:\n${e}`);
        jResponse.error_code = -3; // exception
        jResponse.error_message = `EXCEPTION:\n${e}`;
    }
    finally {
        return jResponse;
    }
};
