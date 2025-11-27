`use strict`;

import logger from "@/components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as database from "@/pages/api/biz/database/database";
import * as dynamicSql from "@/pages/api/biz/dynamicSql";
import { DBConnectionManager } from "@/pages/api/biz/workflow/dbConnectionManager";

const executeService = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    switch (jRequest.commandName) {
      case constants.commands.DYNAMIC_SEQ_SELECT_ALL:
        jResponse = await selectAll(jRequest.systemCode, txnId, jRequest);
        break;
      case constants.commands.DYNAMIC_SEQ_UPDATE_ONE:
        jResponse = await updateOne(jRequest.systemCode, txnId, jRequest);
        break;
      case constants.commands.DYNAMIC_SEQ_DELETE_ONE:
        jResponse = await deleteOne(jRequest.systemCode, txnId, jRequest);
        break;
      default:
        throw new Error(constants.messages.SERVER_NOT_SUPPORTED_METHOD);
    }
  } catch (e) {
    jResponse.error_code = -1;
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

async function selectAll(systemCode, txnId, jRequest) {
  var jResponse = {};

  try {
    var SQLs = [];

    var sql = await dynamicSql.getSQL(systemCode, `select_TB_COR_SQL_INFO`, 1);

    const sql_result = await database.executeSQL(sql, [systemCode]);

    if (sql_result) {
      sql_result.rows.forEach((row) => {
        SQLs = sql_result.rows;
      });
      jResponse.data = SQLs;
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.EMPTY_STRING;
    } else {
      throw new Error(constants.messages.SERVER_SQL_NOT_LOADED);
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
}

async function updateOne(systemCode, txnId, jRequest) {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
      return jResponse;
    }
    if (!jRequest.systemCode) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [systemCode]`;
      return jResponse;
    }

    if (!jRequest.sqlName) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [sqlName]`;
      return jResponse;
    }

    if (!jRequest.sqlSeq) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [sqlSeq]`;
      return jResponse;
    }

    if (!jRequest.sqlContent) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [sqlContent]`;
      return jResponse;
    }

    var sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_COR_SQL_INFO`,
      2
    );
    var select_TB_COR_SQL_INFO_02 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.sqlName,
      jRequest.sqlSeq,
    ]);

    if (
      jRequest.action === "Update" &&
      select_TB_COR_SQL_INFO_02.rowCount <= 0
    ) {
      jResponse.error_code = -1;
      jResponse.error_message = `The SQL not used.`;
      return jResponse;
    }
    if (
      jRequest.action === "Create" &&
      select_TB_COR_SQL_INFO_02.rowCount > 0
    ) {
      jResponse.error_code = -1;
      jResponse.error_message = `The SQL already exist.`;
      return jResponse;
    }

    if (jRequest.action === "Update") {
      sql = await dynamicSql.getSQL(
        jRequest.systemCode,
        `update_TB_COR_SQL_INFO`,
        1
      );
      var update_TB_COR_SQL_INFO_01 = await database.executeSQL(sql, [
        jRequest.sqlContent,
        jRequest.userId,
        jRequest.systemCode,
        jRequest.sqlName,
        jRequest.sqlSeq,
      ]);

      if (update_TB_COR_SQL_INFO_01.rowCount == 1) {
        setSQL(
          jRequest.systemCode,
          jRequest.sqlName,
          jRequest.sqlSeq,
          jRequest.sqlContent
        );

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING;
      } else {
        jResponse.error_code = -3;
        jResponse.error_message = `Failed to update dynamicSql.\n`;
      }
    } else if (jRequest.action === "Create") {
      sql = await dynamicSql.getSQL(
        jRequest.systemCode,
        `insert_TB_COR_SQL_INFO`,
        1
      );
      var insert_TB_COR_SQL_INFO_01 = await database.executeSQL(sql, [
        jRequest.systemCode,
        jRequest.sqlName,
        jRequest.sqlSeq,
        jRequest.sqlContent,
        jRequest.userId,
      ]);

      if (insert_TB_COR_SQL_INFO_01.rowCount == 1) {
        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING;
      } else {
        jResponse.error_code = -3;
        jResponse.error_message = `Failed to create dynamicSql.\n`;
      }
    }
  } catch (e) {
    loggerlogger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
}

async function deleteOne(systemCode, txnId, jRequest) {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId`;
      return jResponse;
    }
    if (!jRequest.systemCode) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [systemCode]`;
      return jResponse;
    }

    if (!jRequest.sqlName) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [sqlName]`;
      return jResponse;
    }

    if (!jRequest.sqlSeq) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [sqlSeq]`;
      return jResponse;
    }

    var sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_COR_SQL_INFO`,
      2
    );
    var select_TB_COR_SQL_INFO_02 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.sqlName,
      jRequest.sqlSeq,
    ]);

    if (select_TB_COR_SQL_INFO_02.rowCount <= 0) {
      jResponse.error_code = -1;
      jResponse.error_message = `The SQL not exist.`;
      return jResponse;
    }

    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `delete_TB_COR_SQL_INFO`,
      1
    );
    var delete_TB_COR_SQL_INFO_01 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.sqlName,
      jRequest.sqlSeq,
    ]);

    if (delete_TB_COR_SQL_INFO_01.rowCount == 1) {
      deleteSQL(
        jRequest.systemCode,
        jRequest.sqlName,
        jRequest.sqlSeq,
        jRequest.sqlContent
      );

      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.EMPTY_STRING;
    } else {
      jResponse.error_code = -3;
      jResponse.error_message = `Failed to delete dynamicSql.\n`;
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
}

async function loadAll() {
  try {
    // 이미 로딩했으면 로딩 안하고 성공 리턴
    if (process && process.dynamicSql && process.dynamicSql.size > 0) {
      return process.dynamicSql;
    }

    logger.warn(`Start loading service queries.\n`);

    var loadedSQLs = new Map();

    var sql = `
      SELECT *
        FROM BRUNNER.TB_COR_SQL_INFO
       ORDER BY SYSTEM_CODE, SQL_NAME, SQL_SEQ, SQL_CONTENT
       ;
    `;

    const sql_result = await database.executeSQL(sql, []);

    if (sql_result && sql_result.rowCount > 0) {
      sql_result.rows.forEach((row) => {
        loadedSQLs.set(
          `${row.system_code}_${row.sql_name}_${row.sql_seq}`,
          row.sql_content
        );
      });
      process.dynamicSql = loadedSQLs;
      return process.dynamicSql.size;
    } else {
      throw new Error(constants.messages.SERVER_SQL_NOT_LOADED);
    }
  } catch (e) {
    throw e;
  } finally {
    for (const systemCode of Object.keys(constants.SystemCode)) {
      // ✅ 싱글톤 인스턴스
      DBConnectionManager.getInstance().loadAllFromDatabase(
        constants.SystemCode[systemCode],
        database,
        dynamicSql
      );
    }
    return process.dynamicSql;
  }
}

const getSQL = async (systemCode, sqlName, sqlSeq) => {
  try {
    var sql = process.dynamicSql.get(`${systemCode}_${sqlName}_${sqlSeq}`);
    if (!sql) throw new Error(constants.messages.DATABASE_FAILED);
    return sql;
  } catch (e) {
    throw e;
  }
};

const setSQL = async (systemCode, sqlName, sqlSeq, sqlContent) => {
  try {
    var sql = process.dynamicSql.set(
      `${systemCode}_${sqlName}_${sqlSeq}`,
      sqlContent
    );
    return sql;
  } catch (e) {
    throw e;
  }
};

const deleteSQL = async (systemCode, sqlName, sqlSeq) => {
  try {
    var sql = process.dynamicSql.delete(`${systemCode}_${sqlName}_${sqlSeq}`);
    return sql;
  } catch (e) {
    throw e;
  }
};

const getSQL00 = async (sqlName, sqlSeq) => {
  try {
    var sql = await getSQL(constants.SystemCode.Brunner, sqlName, sqlSeq);
    return sql;
  } catch (e) {
    throw e;
  }
};

export { executeService, getSQL, getSQL00, loadAll };
