`use strict`

import logger from "../winston/logger"
import * as database from './database/database'
import * as serviceSQL from './serviceSQL'

export default function executeService(txnId, jRequest) {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case "asset.getIncomeHistory":
                jResponse = getIncomeHistory(txnId, jRequest);
                break;
            case "asset.addIncome":
                jResponse = addIncome(txnId, jRequest);
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

const addIncome = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = serviceSQL.getSQL00('insert_TB_COR_INCOME_HIST', 1);
        var insert_TB_COR_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId,
                jRequest.amount,
                jRequest.comments
            ]);

        // logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_USER_MST_01.rows[0])}\n`);

        if(insert_TB_COR_INCOME_HIST_01.rowCount == 1){
            jResponse.error_code = 0;
            jResponse.error_message = "success";    
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = "fail";    
 
        }
    } catch (e) {
        logger.error(`EXCEPTION:\n${e}`);
        jResponse.error_code = -3; // exception
        jResponse.error_message = `EXCEPTION:\n${e}`;
    } finally {
        return jResponse;
    }
};

const getIncomeHistory = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = serviceSQL.getSQL00('select_TB_COR_INCOME_HIST', 1);
        var select_TB_COR_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId
            ]);

        // logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_USER_MST_01.rows[0])}\n`);

        jResponse.incomeHistory = select_TB_COR_INCOME_HIST_01.rows;

        jResponse.error_code = 0;
        jResponse.error_message = "";
    } catch (e) {
        logger.error(`EXCEPTION:\n${e}`);
        jResponse.error_code = -3; // exception
        jResponse.error_message = `EXCEPTION:\n${e}`;
    } finally {
        return jResponse;
    }
};
