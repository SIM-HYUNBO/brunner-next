`use strict`

import logger from "../winston/logger"
import * as constants from '@/components/constants'
import * as database from "./database/database"
import * as db_cor_sql_info from './tb_cor_sql_info'

const executeService = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case constants.commands.COMMAND_TB_COR_POST_INFO_SELECT_ALL:
                jResponse = await selectAll(txnId, jRequest);
                break;
            case constants.commands.COMMAND_TB_COR_POST_INFO_INSERT_ONE:
                jResponse = await insertOne(txnId, jRequest);
                break;
            case constants.commands.COMMAND_TB_COR_POST_INFO_UPDATE_ONE:
                jResponse = await updateOne(txnId, jRequest);
                break;
            case constants.commands.COMMAND_TB_COR_POST_INFO_DELETE_ONE:
                jResponse = await deleteOne(txnId, jRequest);
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

const selectAll = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.userId = jRequest.userId;

        if (!jRequest.postInfo) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [postInfo].`;
            return jResponse;
        }

        if (!jRequest.postInfo.postType) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [postType]`;
            return jResponse;
        }

        var sql = null
        sql = await db_cor_sql_info.getSQL00('select_TB_COR_POST_INFO', 1);
        var select_TB_COR_POST_INFO = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.postInfo.postType
            ]);

        for (var i = 0; i < select_TB_COR_POST_INFO.rows.length; i++) {
            const comments = [];

            sql = await db_cor_sql_info.getSQL00('select_TB_COR_POST_COMMENT_INFO', 1);
            var select_TB_COR_POST_COMMENT_INFO = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    select_TB_COR_POST_INFO.rows[i].post_id
                ]);

            select_TB_COR_POST_INFO.rows[i].comments = select_TB_COR_POST_COMMENT_INFO.rows;
        }

        jResponse.postList = select_TB_COR_POST_INFO.rows;

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const insertOne = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        var postId = generateUUID();
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await db_cor_sql_info.getSQL00('insert_TB_COR_POST_INFO', 1);

        var insert_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                postId,
                jRequest.postInfo.postType,
                jRequest.postInfo.content,
                jRequest.postInfo.userId
            ]);

        if (insert_TB_COR_POST_INFO_01.rowCount === 1) {
            sql = await db_cor_sql_info.getSQL00('select_TB_COR_POST_INFO', 2);
            var select_TB_COR_POST_INFO_02 = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    postId
                ]);

            jResponse.postInfo = select_TB_COR_POST_INFO_02.rows[0];
            jResponse.postInfo.comments = [];
            jResponse.error_code = 0;
            jResponse.error_message = constants.messages.EMPTY_STRING

        }
        else {
            jResponse.error_code = -1; // exception
            jResponse.error_message = 'fail to create new post';
        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
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
        sql = await db_cor_sql_info.getSQL00('update_TB_COR_POST_INFO', 1);
        var update_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.postInfo.postId,
                jRequest.postInfo.content,
                jRequest.postInfo.userId
            ]);

        if (update_TB_COR_POST_INFO_01.rowCount === 1) {
            jResponse.error_code = 0;
            jResponse.error_message = constants.messages.EMPTY_STRING
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = `Fail to edit post.`;
            return jResponse;
        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const deleteOne = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        if (!jRequest.postInfo) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [postInfo]`;

            return jResponse;
        }

        var sql = null
        sql = await db_cor_sql_info.getSQL00('delete_TB_COR_POST_INFO', 1);
        var delete_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.postInfo.postId,
                jRequest.postInfo.userId
            ]);

        if (delete_TB_COR_POST_INFO_01.rowCount === 1) {
            sql = await db_cor_sql_info.getSQL00('delete_TB_COR_POST_COMMENT_INFO', 1);
            var delete_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    jRequest.postInfo.postId,
                    jRequest.postInfo.userId
                ]);

            jResponse.error_code = 0;
            jResponse.error_message = constants.messages.EMPTY_STRING
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = `Fail to delete post.`;
            return jResponse;
        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

function generateUUID() { // Public Domain/MIT
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export { executeService, generateUUID };