`use strict`

import logger from "../winston/logger"
import * as constants from '@/components/constants'
import * as database from './database/database'
import * as db_cor_sql_info from './dynamicSql'

const executeService = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    switch (jRequest.commandName) {
      case constants.commands.COMMAND_DYNAMIC_SEQ_SELECT_ALL:
        jResponse = await selectAll(txnId, jRequest);
        break;
      case constants.commands.COMMAND_DYNAMIC_SEQ_UPDATE_ONE:
        jResponse = await updateOne(txnId, jRequest);
        break;
      case constants.commands.COMMAND_DYNAMIC_SEQ_DELETE_ONE:
        jResponse = await deleteOne(txnId, jRequest);
        break; 
      default:
      case constants.commands.COMMAND_DYNAMIC_SEQ_LOAD_ALL:
          jResponse = await loadAll(txnId, jRequest);
          break;
    }
  } catch (error) {
    logger.error(`message:${error.message}\n stack:${error.stack}\n`);
    jResponse.error_message = error.message;
  } finally {
    return jResponse;
  }
}

async function selectAll(txnId, jRequest) {
  var jResponse = {};

  try {

    var SQLs = [];

    var sql = await db_cor_sql_info.getSQL00(`select_TB_COR_SQL_INFO`, 1);

    const sql_result = await database.executeSQL(sql, []);

    if (sql_result) {
      sql_result.rows.forEach(row => {
        SQLs = sql_result.rows;
      });
      jResponse.data = SQLs;
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.EMPTY_STRING;
    }
    else {
      throw new Error(constants.messages.MESSAGE_SERVER_SQL_NOT_LOADED);
    }
  }
  catch (err) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message
  }
  finally {
    return jResponse;
  }
};

async function updateOne(txnId, jRequest) {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [userId`;
      return jResponse;
    }
    if (!jRequest.systemCode) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [systemCode]`;
      return jResponse;
    }

    if (!jRequest.sqlName) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [sqlName]`;
      return jResponse;
    }

    if (!jRequest.sqlSeq) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [sqlSeq]`;
      return jResponse;
    }

    if (!jRequest.sqlContent) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [sqlContent]`;
      return jResponse;
    }

    var sql = await db_cor_sql_info.getSQL00(`select_TB_COR_SQL_INFO`, 2);
    var select_TB_COR_SQL_INFO_02 = await database.executeSQL(sql,
      [
        jRequest.systemCode,
        jRequest.sqlName,
        jRequest.sqlSeq
      ]);

    if (jRequest.action === 'Update' && select_TB_COR_SQL_INFO_02.rowCount <= 0) {
      jResponse.error_code = -1;
      jResponse.error_message = `The SQL not used.`;
      return jResponse;
    }
    if (jRequest.action === 'Create' && select_TB_COR_SQL_INFO_02.rowCount > 0) {
      jResponse.error_code = -1;
      jResponse.error_message = `The SQL already exist.`;
      return jResponse;
    }

    if (jRequest.action === 'Update') {
      sql = await db_cor_sql_info.getSQL00(`update_TB_COR_SQL_INFO`, 1);
      var update_TB_COR_SQL_INFO_01 = await database.executeSQL(sql,
        [
          jRequest.sqlContent,
          jRequest.userId,
          jRequest.systemCode,
          jRequest.sqlName,
          jRequest.sqlSeq
        ]);

      if (update_TB_COR_SQL_INFO_01.rowCount == 1) {
        setSQL(jRequest.systemCode, jRequest.sqlName, jRequest.sqlSeq, jRequest.sqlContent);

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING;
      }
      else {
        jResponse.error_code = -3;
        jResponse.error_message = `Failed to update serviceSQL.\n`
      }
    }
    else if (jRequest.action === 'Create') {
      sql = await db_cor_sql_info.getSQL00(`insert_TB_COR_SQL_INFO`, 1);
      var insert_TB_COR_SQL_INFO_01 = await database.executeSQL(sql,
        [
          jRequest.systemCode,
          jRequest.sqlName,
          jRequest.sqlSeq,
          jRequest.sqlContent,
          jRequest.userId
        ]);

      if (insert_TB_COR_SQL_INFO_01.rowCount == 1) {
        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING;
      }
      else {
        jResponse.error_code = -3;
        jResponse.error_message = `Failed to create serviceSQL.\n`
      }
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message
  } finally {
    return jResponse;
  }
};

async function deleteOne(txnId, jRequest) {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [userId`;
      return jResponse;
    }
    if (!jRequest.systemCode) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [systemCode]`;
      return jResponse;
    }

    if (!jRequest.sqlName) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [sqlName]`;
      return jResponse;
    }

    if (!jRequest.sqlSeq) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [sqlSeq]`;
      return jResponse;
    }

    var sql = await db_cor_sql_info.getSQL00(`select_TB_COR_SQL_INFO`, 2);
    var select_TB_COR_SQL_INFO_02 = await database.executeSQL(sql,
      [
        jRequest.systemCode,
        jRequest.sqlName,
        jRequest.sqlSeq
      ]);

    if (select_TB_COR_SQL_INFO_02.rowCount <= 0) {
      jResponse.error_code = -1;
      jResponse.error_message = `The SQL not exist.`;
      return jResponse;
    }

    sql = await db_cor_sql_info.getSQL00(`delete_TB_COR_SQL_INFO`, 1);
    var delete_TB_COR_SQL_INFO_01 = await database.executeSQL(sql,
      [
        jRequest.systemCode,
        jRequest.sqlName,
        jRequest.sqlSeq
      ]);

    if (delete_TB_COR_SQL_INFO_01.rowCount == 1) {
      deleteSQL(jRequest.systemCode, jRequest.sqlName, jRequest.sqlSeq, jRequest.sqlContent);

      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.EMPTY_STRING;
    }
    else {
      jResponse.error_code = -3;
      jResponse.error_message = `Failed to delete serviceSQL.\n`
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message
  } finally {
    return jResponse;
  }
};

async function loadAll(txnId, jRequest) {
  try {

    // 이미 로딩했으면 로딩 안하고 성공 리턴
    if (process && process.serviceSQL && process.serviceSQL.size > 0) {
      return process.serviceSQL;
    }

    logger.info(`Start loading service queries.\n`)

    var loadedSQLs = new Map();

    var sql = `
      SELECT *
        FROM BRUNNER.TB_COR_SQL_INFO
       ORDER BY SYSTEM_CODE, SQL_NAME, SQL_SEQ, SQL_CONTENT
       ;
    `;

    const sql_result = await database.executeSQL(sql, []);

    if (sql_result && sql_result.rowCount > 0) {
      sql_result.rows.forEach(row => {
        loadedSQLs.set(`${row.system_code}_${row.sql_name}_${row.sql_seq}`, row.sql_content);
      });
      process.serviceSQL = loadedSQLs;
      return process.serviceSQL.size;
    }
    else {
      throw new Error(constants.messages.MESSAGE_SERVER_SQL_NOT_LOADED);
    }
  }
  catch (err) {
    throw err;
  }
  finally {
    return process.serviceSQL.size;
  }
};

const getSQL = async (systemCode, sqlName, sqlSeq) => {
  try {

    var sql = process.serviceSQL.get(`${systemCode}_${sqlName}_${sqlSeq}`);
    return sql;
  }
  catch (err) {
    throw err;
  }
};

const setSQL = async (systemCode, sqlName, sqlSeq, sqlContent) => {
  try {

    var sql = process.serviceSQL.set(`${systemCode}_${sqlName}_${sqlSeq}`, sqlContent);
    return sql;
  }
  catch (err) {
    throw err;
  }
};

const deleteSQL = async (systemCode, sqlName, sqlSeq) => {
  try {

    var sql = process.serviceSQL.delete(`${systemCode}_${sqlName}_${sqlSeq}`);
    return sql;
  }
  catch (err) {
    throw err;
  }
};

const getSQL00 = async (sqlName, sqlSeq) => {
  try {
    var sql = await getSQL(process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE, sqlName, sqlSeq);
    return sql;
  }
  catch (err) {
    throw err;
  }
};

export { executeService, getSQL, getSQL00, loadAll };
