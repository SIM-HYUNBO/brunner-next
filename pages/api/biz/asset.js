`use strict`

import logger from "../winston/logger"
import * as database from './database/database'
import * as serviceSQL from './serviceSQL'

const executeService = (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case "asset.getIncomeHistory":
                jResponse = getIncomeHistory(txnId, jRequest);
                break;
            case "asset.updateIncome":
                jResponse = updateIncome(txnId, jRequest);
                break;
            case "asset.deleteIncome":
                jResponse = deleteIncome(txnId, jRequest);
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
                jRequest.comment
            ]);

        // logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_USER_MST_01.rows[0])}\n`);

        if (insert_TB_COR_INCOME_HIST_01.rowCount == 1) {
            jResponse.error_code = 0;
            jResponse.error_message = "success";
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = "Database fail";

        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
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
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const deleteIncome = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = serviceSQL.getSQL00('delete_TB_COR_INCOME_HIST', 1);
        var delete_TB_COR_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.historyId,
                jRequest.systemCode,
                jRequest.userId
            ]);

        // logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_USER_MST_01.rows[0])}\n`);

        if (delete_TB_COR_INCOME_HIST_01.rowCount === 1) {
            jResponse.error_code = 0;
            jResponse.error_message = "success";
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = "Database fail";
        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const updateIncome = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = serviceSQL.getSQL00('update_TB_COR_INCOME_HIST', 1);
        var update_TB_COR_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.amount,
                jRequest.comment,
                jRequest.userId,
                jRequest.historyId
            ]);

        // logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_USER_MST_01.rows[0])}\n`);

        if (update_TB_COR_INCOME_HIST_01.rowCount === 1) {
            jResponse.error_code = 0;
            jResponse.error_message = "success";
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = "Database fail";
        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

export { executeService };