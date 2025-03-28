`use strict`;

import logger from "./winston/logger"
import * as database from "./biz/database/database"
import * as tb_cor_sql_info from "./biz/tb_cor_sql_info"

export const getRequestResult = async (
  systemCode,
  apiName,
  condition1,
  condition2,
  condition3,
  condition4,
  condition5,
  condition6,
  condition7,
  condition8,
  condition9,
  condition10
) => {
  var sql = null;
  sql = await tb_cor_sql_info.getSQL00("select_TB_COR_REQUEST_RESULT", 1);
  var select_TB_COR_REQUEST_RESULT_01 = await database.executeSQL(sql, [
    systemCode,
    apiName,
    condition1,
    condition2,
    condition3,
    condition4,
    condition5,
    condition6,
    condition7,
    condition8,
    condition9,
    condition10,
  ]);

  if (select_TB_COR_REQUEST_RESULT_01.rows.length > 0)
    return select_TB_COR_REQUEST_RESULT_01.rows[0].request_result;
  else return null;
};

export const saveRequestResult = async (
  systemCode,
  apiName,
  condition1,
  condition2,
  condition3,
  condition4,
  condition5,
  condition6,
  condition7,
  condition8,
  condition9,
  condition10,
  requestResult
) => {
  var sql = null;
  sql = await tb_cor_sql_info.getSQL00("insert_TB_COR_REQUEST_RESULT", 1);
  var insert_TB_COR_REQUEST_RESULT_01 = await database.executeSQL(sql, [
    systemCode,
    apiName,
    condition1,
    condition2,
    condition3,
    condition4,
    condition5,
    condition6,
    condition7,
    condition8,
    condition9,
    condition10,
    requestResult
  ]);

  return insert_TB_COR_REQUEST_RESULT_01.rowCount;
};

export const deleteRequestResult = async (
  systemCode,
  condition5
) => {
  var sql = null;
  sql = await tb_cor_sql_info.getSQL00("delete_TB_COR_REQUEST_RESULT", 1);
  var delete_TB_COR_REQUEST_RESULT_01 = await database.executeSQL(sql, [
    systemCode,
    condition5
  ]);

  return delete_TB_COR_REQUEST_RESULT_01.rowCount;
};