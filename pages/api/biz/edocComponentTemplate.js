`use strict`

import logger from "../winston/logger"
import * as constants from '@/components/constants'
import * as database from "./database/database"
import * as dynamicSql from './dynamicSql'

const executeService = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case constants.commands.COMMAND_EDOC_COMPONENT_TEMPLATES_SELECT_ALL:
                jResponse = await selectAll(txnId, jRequest);
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


        var sql = null
        sql = await dynamicSql.getSQL00('select_TB_DOC_COMPONENT_TEMPLATE', 1);
        var select_TB_DOC_COMPONENT_TEMPLATE = await database.executeSQL(sql,
            [
                jRequest.systemCode
            ]);

        jResponse.templateList = select_TB_DOC_COMPONENT_TEMPLATE.rows;

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

// const insertOne = async (txnId, jRequest) => {
//     var jResponse = {};

//     try {
//         var postId = generateUUID();
//         jResponse.commanaName = jRequest.commandName;

//         var sql = null
//         sql = await dynamicSql.getSQL00('insert_TB_COR_POST_INFO', 1);

//         var insert_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
//             [
//                 jRequest.systemCode,
//                 postId,
//                 jRequest.postInfo.postType,
//                 jRequest.postInfo.content,
//                 jRequest.postInfo.userId
//             ]);

//         if (insert_TB_COR_POST_INFO_01.rowCount === 1) {
//             sql = await dynamicSql.getSQL00('select_TB_COR_POST_INFO', 2);
//             var select_TB_COR_POST_INFO_02 = await database.executeSQL(sql,
//                 [
//                     jRequest.systemCode,
//                     postId
//                 ]);

//             jResponse.postInfo = select_TB_COR_POST_INFO_02.rows[0];
//             jResponse.postInfo.comments = [];
//             jResponse.error_code = 0;
//             jResponse.error_message = constants.messages.EMPTY_STRING

//         }
//         else {
//             jResponse.error_code = -1; // exception
//             jResponse.error_message = 'fail to create new post';
//         }
//     } catch (e) {
//         logger.error(e);
//         jResponse.error_code = -1; // exception
//         jResponse.error_message = e.message
//     } finally {
//         return jResponse;
//     }
// };

// const updateOne = async (txnId, jRequest) => {
//     var jResponse = {};

//     try {
//         jResponse.commanaName = jRequest.commandName;

//         var sql = null
//         sql = await dynamicSql.getSQL00('update_TB_COR_POST_INFO', 1);
//         var update_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
//             [
//                 jRequest.systemCode,
//                 jRequest.postInfo.postId,
//                 jRequest.postInfo.content,
//                 jRequest.postInfo.userId
//             ]);

//         if (update_TB_COR_POST_INFO_01.rowCount === 1) {
//             jResponse.error_code = 0;
//             jResponse.error_message = constants.messages.EMPTY_STRING
//         }
//         else {
//             jResponse.error_code = -1;
//             jResponse.error_message = `Fail to edit post.`;
//             return jResponse;
//         }
//     } catch (e) {
//         logger.error(e);
//         jResponse.error_code = -1; // exception
//         jResponse.error_message = e.message
//     } finally {
//         return jResponse;
//     }
// };

// const deleteOne = async (txnId, jRequest) => {
//     var jResponse = {};

//     try {
//         jResponse.commanaName = jRequest.commandName;

//         if (!jRequest.postInfo) {
//             jResponse.error_code = -2;
//             jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [postInfo]`;

//             return jResponse;
//         }

//         var sql = null
//         sql = await dynamicSql.getSQL00('delete_TB_COR_POST_INFO', 1);
//         var delete_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
//             [
//                 jRequest.systemCode,
//                 jRequest.postInfo.postId,
//                 jRequest.postInfo.userId
//             ]);

//         if (delete_TB_COR_POST_INFO_01.rowCount === 1) {
//             sql = await dynamicSql.getSQL00('delete_TB_COR_POST_COMMENT_INFO', 1);
//             var delete_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
//                 [
//                     jRequest.systemCode,
//                     jRequest.postInfo.postId,
//                     jRequest.postInfo.userId
//                 ]);

//             jResponse.error_code = 0;
//             jResponse.error_message = constants.messages.EMPTY_STRING
//         }
//         else {
//             jResponse.error_code = -1;
//             jResponse.error_message = `Fail to delete post.`;
//             return jResponse;
//         }
//     } catch (e) {
//         logger.error(e);
//         jResponse.error_code = -1; // exception
//         jResponse.error_message = e.message
//     } finally {
//         return jResponse;
//     }
// };

function generateUUID() { // Public Domain/MIT
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export { executeService, generateUUID };