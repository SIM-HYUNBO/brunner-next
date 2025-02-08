`use strict`

import logger from "../winston/logger"
import * as constants from '@/components/constants'
import * as database from './database/database'
import * as db_cor_sql_info from './tb_cor_sql_info'

const executeService = (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case constants.COMMAND_TB_COR_INCOME_HIST_INSERTONE:
                jResponse = insertOne(txnId, jRequest);
                break;
            case constants.COMMAND_TB_COR_INCOME_HIST_UPDATEONE:
                jResponse = updateOne(txnId, jRequest);
                break;
            case constants.COMMAND_TB_COR_INCOME_HIST_DELETEONE:
                jResponse = deleteOne(txnId, jRequest);
                break;
            case constants.COMMAND_TB_COR_INCOME_HIST_SELECTONE:
                jResponse = selectOne(txnId, jRequest);
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

const insertOne = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await db_cor_sql_info.getSQL00('insert_TB_COR_INCOME_HIST', 1);
        var insert_TB_COR_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId,
                jRequest.amount,
                jRequest.comment
            ]);

        if (insert_TB_COR_INCOME_HIST_01.rowCount == 1) {
            jResponse.error_code = 0;
            jResponse.error_message = constants.EMPTY_STRING;
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = constants.MESSAGE_DATABASE_FAILED;

        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const selectOne = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await db_cor_sql_info.getSQL00('select_TB_COR_INCOME_HIST', 1);
        var select_TB_COR_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId
            ]);

        jResponse.incomeHistory = select_TB_COR_INCOME_HIST_01.rows;

        jResponse.error_code = 0;
        jResponse.error_message = constants.EMPTY_STRING;
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const deleteOne = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await db_cor_sql_info.getSQL00('delete_TB_COR_INCOME_HIST', 1);
        var delete_TB_COR_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.historyId,
                jRequest.systemCode,
                jRequest.userId
            ]);

        if (delete_TB_COR_INCOME_HIST_01.rowCount === 1) {
            jResponse.error_code = 0;
            jResponse.error_message = constants.EMPTY_STRING;
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = constants.MESSAGE_DATABASE_FAILED;
        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const updateOne = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await db_cor_sql_info.getSQL00('update_TB_COR_INCOME_HIST', 1);
        var update_TB_COR_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.amount,
                jRequest.comment,
                jRequest.userId,
                jRequest.historyId
            ]);

        if (update_TB_COR_INCOME_HIST_01.rowCount === 1) {
            jResponse.error_code = 0;
            jResponse.error_message = constants.EMPTY_STRING;
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = constants.MESSAGE_DATABASE_FAILED;
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