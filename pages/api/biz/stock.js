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

        if (!jRequest.userId) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [userId] is a required field. 
            Please enter a value.`;
            return jResponse;
        }

        var sql = serviceSQL.getSQL00(`select_TB_COR_USER_MST`, 1);
        var select_TB_COR_USER_MST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId
            ]);

        if (select_TB_COR_USER_MST_01.rowCount == 0) {
            jResponse.error_code = -1;
            jResponse.error_message = `Invalid user id.`;
            return jResponse;
        }

        const stockSymbol = jRequest.stockSymbol;
        const apiKey = 'UP317KBI7Z7WQOZD'; // 무료 api key는 제약사항이 많음. 1일 25번만 요청 가능 등
        const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&apikey=${apiKey}`

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch stock info');
        }
        const data = await response.json();
        if (data["Error Message"]) {
            jResponse.error_code = -1; // exception
            jResponse.error_message = data["Error Message"];
        }
        else if (data["Information"]) {
            jResponse.error_code = -1; // exception
            jResponse.error_message = data["Information"];
        }
        else {
            jResponse.stockInfo = data;
            jResponse.error_code = 0; // exception
            jResponse.error_message = "";
        }


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
