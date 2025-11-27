`use strict`;

import logger from "@/components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as commonFunctions from "@/components/core/commonFunctions";
import * as database from "@/pages/api/biz/database/database";
import * as dynamicSql from "@/pages/api/biz/dynamicSql";

const executeService = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    switch (jRequest.commandName) {
      case constants.commands.POST_INFO_SELECT_ALL:
        jResponse = await selectAll(txnId, jRequest);
        break;
      case constants.commands.POST_INFO_INSERT_ONE:
        jResponse = await insertOne(txnId, jRequest);
        break;
      case constants.commands.POST_INFO_UPDATE_ONE:
        jResponse = await updateOne(txnId, jRequest);
        break;
      case constants.commands.POST_INFO_DELETE_ONE:
        jResponse = await deleteOne(txnId, jRequest);
        break;
      default:
        throw new Error(constants.messages.SERVER_NOT_SUPPORTED_METHOD);
        break;
    }
  } catch (e) {
    jResponse.error_code = -1;
    jResponse.error_message = e.message;
    logger.error(`message:${e.message}\n stack:${e.stack}\n`);
  } finally {
    return jResponse;
  }
};

const selectAll = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;
    jResponse.userId = jRequest.userId;

    if (!jRequest.postInfo) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [postInfo].`;
      return jResponse;
    }

    if (!jRequest.postInfo.postType) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [postType]`;
      return jResponse;
    }

    var sql = null;
    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      "select_BRUNNER.TB_COR_POST_INFO",
      1
    );
    var select_TB_COR_POST_INFO = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.postInfo.postType,
    ]);

    for (var i = 0; i < select_TB_COR_POST_INFO.rows.length; i++) {
      const comments = [];

      sql = await dynamicSql.getSQL(
        jRequest.systemCode,
        "select_BRUNNER.TB_COR_POST_COMMENT_INFO",
        1
      );
      var select_TB_COR_POST_COMMENT_INFO = await database.executeSQL(sql, [
        jRequest.systemCode,
        select_TB_COR_POST_INFO.rows[i].post_id,
      ]);

      select_TB_COR_POST_INFO.rows[i].comments =
        select_TB_COR_POST_COMMENT_INFO.rows;
    }

    jResponse.postList = select_TB_COR_POST_INFO.rows;

    jResponse.error_code = 0;
    jResponse.error_message = constants.messages.EMPTY_STRING;
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const insertOne = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    var postId = commonFunctions.generateUUID();
    jResponse.commanaName = jRequest.commandName;

    if (!jRequest.postInfo.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId].`;
      return jResponse;
    }

    var sql = null;
    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      "insert_BRUNNER.TB_COR_POST_INFO",
      1
    );

    var insert_TB_COR_POST_INFO_01 = await database.executeSQL(sql, [
      jRequest.systemCode,
      postId,
      jRequest.postInfo.postType,
      jRequest.postInfo.content,
      jRequest.postInfo.userId,
    ]);

    if (insert_TB_COR_POST_INFO_01.rowCount === 1) {
      sql = await dynamicSql.getSQL(
        jRequest.systemCode,
        "select_BRUNNER.TB_COR_POST_INFO",
        2
      );
      var select_TB_COR_POST_INFO_02 = await database.executeSQL(sql, [
        jRequest.systemCode,
        postId,
      ]);

      jResponse.postInfo = select_TB_COR_POST_INFO_02.rows[0];
      jResponse.postInfo.comments = [];
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.EMPTY_STRING;
    } else {
      jResponse.error_code = -1; // exception
      jResponse.error_message = "fail to create new post";
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const updateOne = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    var sql = null;
    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      "update_BRUNNER.TB_COR_POST_INFO",
      1
    );
    var update_TB_COR_POST_INFO_01 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.postInfo.postId,
      jRequest.postInfo.content,
      jRequest.postInfo.userId,
    ]);

    if (update_TB_COR_POST_INFO_01.rowCount === 1) {
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.EMPTY_STRING;
    } else {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.FAILED_TO_UPDATE_DATA;
      return jResponse;
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1; // exception
    jResponse.error_message = e.message;
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
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [postInfo]`;

      return jResponse;
    }

    var sql = null;
    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      "delete_BRUNNER.TB_COR_POST_INFO",
      1
    );
    var delete_TB_COR_POST_INFO_01 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.postInfo.postId,
      jRequest.postInfo.userId,
    ]);

    if (delete_TB_COR_POST_INFO_01.rowCount === 1) {
      sql = await dynamicSql.getSQL(
        jRequest.systemCode,
        "delete_BRUNNER.TB_COR_POST_COMMENT_INFO",
        1
      );
      var delete_TB_COR_POST_INFO_01 = await database.executeSQL(sql, [
        jRequest.systemCode,
        jRequest.postInfo.postId,
        jRequest.postInfo.userId,
      ]);

      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.EMPTY_STRING;
    } else {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.FAILED_TO_DELETE_DATA;
      return jResponse;
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

export { executeService };
