`use strict`

import logger from "../winston/logger"
import * as constants from '@/components/constants'
import * as database from './database/database'
import * as dynamicSql from './dynamicSql'

const executeService = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case constants.commands.COMMAND_INCOME_HISTORY_INSERT_ONE:
                jResponse = await insertOne(txnId, jRequest);
                break;
            case constants.commands.COMMAND_INCOME_HISTORY_UPDATE_ONE:
                jResponse = await updateOne(txnId, jRequest);
                break;
            case constants.commands.COMMAND_INCOME_HISTORY_DELETE_ONE:
                jResponse = await deleteOne(txnId, jRequest);
                break;
            case constants.commands.COMMAND_INCOME_HISTORY_SELECT_BY_USERID:
                jResponse = await selectByUserId(txnId, jRequest);
                break;
            default:
                break;
        }
    } catch (error) {
    } finally {
        return jResponse;
    }
}

const insertOne = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await dynamicSql.getSQL00('insert_TB_STK_INCOME_HIST', 1);
        var insert_TB_STK_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId,
                jRequest.amount,
                jRequest.comment
            ]);

        if (insert_TB_STK_INCOME_HIST_01.rowCount == 1) {
            jResponse.error_code = 0;
            jResponse.error_message = constants.messages.EMPTY_STRING;
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = constants.messages.MESSAGE_DATABASE_FAILED;

        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const selectByUserId = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await dynamicSql.getSQL00('select_TB_STK_INCOME_HIST', 1);
        var select_TB_STK_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId
            ]);

        jResponse.incomeHistory = select_TB_STK_INCOME_HIST_01.rows;

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING;
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
        sql = await dynamicSql.getSQL00('delete_TB_STK_INCOME_HIST', 1);
        var delete_TB_STK_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.historyId,
                jRequest.systemCode,
                jRequest.userId
            ]);

        if (delete_TB_STK_INCOME_HIST_01.rowCount === 1) {
            jResponse.error_code = 0;
            jResponse.error_message = constants.messages.EMPTY_STRING;
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = constants.messages.MESSAGE_DATABASE_FAILED;
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
        sql = await dynamicSql.getSQL00('update_TB_STK_INCOME_HIST', 1);
        var update_TB_STK_INCOME_HIST_01 = await database.executeSQL(sql,
            [
                jRequest.amount,
                jRequest.comment,
                jRequest.userId,
                jRequest.historyId
            ]);

        if (update_TB_STK_INCOME_HIST_01.rowCount === 1) {
            jResponse.error_code = 0;
            jResponse.error_message = constants.messages.EMPTY_STRING;
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = constants.messages.MESSAGE_DATABASE_FAILED;
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