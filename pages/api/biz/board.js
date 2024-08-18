`use strict`

import logger from "../winston/logger"
import * as database from "./database/database"
import * as serviceSQL from './serviceSQL'
import axios from 'axios';

const executeService = (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case "board.getPostList":
                jResponse = getPostList(txnId, jRequest);
                break;
            case "board.addPost":
                jResponse = addPost(txnId, jRequest);
                break;
            case "board.editPost":
                jResponse = editPost(txnId, jRequest);
                break;
            case "board.deletePost":
                jResponse = deletePost(txnId, jRequest);
                break;
            case "board.addPostComment":
                jResponse = addPostComment(txnId, jRequest);
                break;
            case "board.editPostComment":
                jResponse = editPostComment(txnId, jRequest);
                break;
            case "board.deletePostComment":
                jResponse = deletePostComment(txnId, jRequest);
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

function generateUUID() { // Public Domain/MIT
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const getPostList = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.userId = jRequest.userId;

        if (!jRequest.postInfo) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [postInfo] is a required field. 
            Please set a value.`;
            return jResponse;
        }

        if (!jRequest.postInfo.postType) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [postType] is a required field. 
            Please set a value.`;
            return jResponse;
        }

        var sql = null
        sql = await serviceSQL.getSQL00('select_TB_COR_POST_INFO', 1);
        var select_TB_COR_POST_INFO = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.postInfo.postType
            ]);

        for (var i = 0; i < select_TB_COR_POST_INFO.rows.length; i++) {
            const comments = [];

            sql = await serviceSQL.getSQL00('select_TB_COR_POST_COMMENT_INFO', 1);
            var select_TB_COR_POST_COMMENT_INFO = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    select_TB_COR_POST_INFO.rows[i].post_id
                ]);

            select_TB_COR_POST_INFO.rows[i].comments = select_TB_COR_POST_COMMENT_INFO.rows;
        }

        jResponse.postList = select_TB_COR_POST_INFO.rows;

        jResponse.error_code = 0;
        jResponse.error_message = "";
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const addPost = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        var postId = generateUUID();
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await serviceSQL.getSQL00('insert_TB_COR_POST_INFO', 1);

        var insert_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                postId,
                jRequest.postInfo.postType,
                jRequest.postInfo.content,
                jRequest.postInfo.userId
            ]);

        if (insert_TB_COR_POST_INFO_01.rowCount === 1) {
            sql = await serviceSQL.getSQL00('select_TB_COR_POST_INFO', 2);
            var select_TB_COR_POST_INFO_02 = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    postId
                ]);

            jResponse.postInfo = select_TB_COR_POST_INFO_02.rows[0];
            jResponse.postInfo.comments = [];
            jResponse.error_code = 0;
            jResponse.error_message = "";

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

const editPost = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await serviceSQL.getSQL00('update_TB_COR_POST_INFO', 1);
        var update_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.postInfo.postId,
                jRequest.postInfo.content,
                jRequest.postInfo.userId
            ]);

        if (update_TB_COR_POST_INFO_01.rowCount === 1) {
            jResponse.error_code = 0;
            jResponse.error_message = "";
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

const deletePost = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        if (!jRequest.postInfo) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [postInfo] is a required field. 
            Please set a value.`;

            return jResponse;
        }

        var sql = null
        sql = await serviceSQL.getSQL00('delete_TB_COR_POST_INFO', 1);
        var delete_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.postInfo.postId,
                jRequest.postInfo.userId
            ]);

        if (delete_TB_COR_POST_INFO_01.rowCount === 1) {
            sql = await serviceSQL.getSQL00('delete_TB_COR_POST_COMMENT_INFO', 1);
            var delete_TB_COR_POST_INFO_01 = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    jRequest.postInfo.postId,
                    jRequest.postInfo.userId
                ]);

            jResponse.error_code = 0;
            jResponse.error_message = "";
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

const addPostComment = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        var coommentId = generateUUID();
        var sql = null
        sql = await serviceSQL.getSQL00('insert_TB_COR_POST_COMMENT_INFO', 1);
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
            sql = await serviceSQL.getSQL00('select_TB_COR_POST_COMMENT_INFO', 2);
            var select_TB_COR_POST_COMMENT_INFO_02 = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    jRequest.commentInfo.postId,
                    coommentId
                ]);
            jResponse.commentInfo = select_TB_COR_POST_COMMENT_INFO_02.rows[0];

            jResponse.error_code = 0;
            jResponse.error_message = "";
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

const editPostComment = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        if (!jRequest.commentInfo) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [commentInfo] is a required field. 
            Please set a value.`;

            return jResponse;
        }

        var sql = null
        sql = await serviceSQL.getSQL00('update_TB_COR_POST_COMMENT_INFO', 2);
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
            jResponse.error_message = "";
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

const deletePostComment = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        if (!jRequest.commentInfo) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [commentInfo] is a required field. 
            Please set a value.`;

            return jResponse;
        }

        var sql = null
        sql = await serviceSQL.getSQL00('delete_TB_COR_POST_COMMENT_INFO', 2);
        var delete_TB_COR_POST_COMMENT_INFO_02 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.commentInfo.postId,
                jRequest.commentInfo.commentId,
                jRequest.commentInfo.userId
            ]);

        if (delete_TB_COR_POST_COMMENT_INFO_02.rowCount === 1) {
            jResponse.error_code = 0;
            jResponse.error_message = "";
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