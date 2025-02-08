`use strict`

import logger from "../winston/logger"
import * as constants from '@/components/constants'
import * as database from "./database/database"
import * as db_cor_sql_info from './tb_cor_sql_info'

const executeService = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
             case constants.commands.COMMAND_TB_COR_POST_COMMENT_INFO_INSERTONE:
                jResponse = await insertOne(txnId, jRequest);
                break;
            case constants.commands.COMMAND_TB_COR_POST_COMMENT_INFO_UPDATEONE:
                jResponse = await updateOne(txnId, jRequest);
                break;
            case constants.commands.COMMAND_TB_COR_POST_COMMENT_INFO_DELETEONE:
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

const insertOne = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        var coommentId = generateUUID();
        var sql = null
        sql = await db_cor_sql_info.getSQL00('insert_TB_COR_POST_COMMENT_INFO', 1);
        var insert_TB_COR_POST_COMMENT_INFO_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.commentInfo.postId,
                coommentId,
                jRequest.commentInfo.content,
                jRequest.commentInfo.userId
            ]);

        if (insert_TB_COR_POST_COMMENT_INFO_01.rowCount === 1) {
            sql = null
            sql = await db_cor_sql_info.getSQL00('select_TB_COR_POST_COMMENT_INFO', 2);
            var select_TB_COR_POST_COMMENT_INFO_02 = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    jRequest.commentInfo.postId,
                    coommentId
                ]);
            jResponse.commentInfo = select_TB_COR_POST_COMMENT_INFO_02.rows[0];

            jResponse.error_code = 0;
            jResponse.error_message = constants.messages.EMPTY_STRING;
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = "Failed to create comment.";

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

        if (!jRequest.commentInfo) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [commentInfo]`;

            return jResponse;
        }

        var sql = null
        sql = await db_cor_sql_info.getSQL00('update_TB_COR_POST_COMMENT_INFO', 2);
        var update_TB_COR_POST_COMMENT_INFO_02 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.commentInfo.postId,
                jRequest.commentInfo.commentId,
                jRequest.commentInfo.content,
                jRequest.commentInfo.userId
            ]);

        if (update_TB_COR_POST_COMMENT_INFO_02.rowCount === 1) {
            jResponse.error_code = 0;
            jResponse.error_message = constants.messages.EMPTY_STRING
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = `Failed edit comment.`;
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

        if (!jRequest.commentInfo) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [commentInfo]`;

            return jResponse;
        }

        var sql = null
        sql = await db_cor_sql_info.getSQL00('delete_TB_COR_POST_COMMENT_INFO', 2);
        var delete_TB_COR_POST_COMMENT_INFO_02 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.commentInfo.postId,
                jRequest.commentInfo.commentId,
                jRequest.commentInfo.userId
            ]);

        if (delete_TB_COR_POST_COMMENT_INFO_02.rowCount === 1) {
            jResponse.error_code = 0;
            jResponse.error_message = constants.messages.EMPTY_STRING;
        }
        else {
            jResponse.error_code = -1;
            jResponse.error_message = `Fail to delete comment.`;
            return jResponse;
        }
    }
    catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    }
    finally {
        return jResponse;
    }
};

export { executeService };