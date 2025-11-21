`use strict`;

import logger from "@/components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as database from "./../database/database";
import * as dynamicSql from "./../dynamicSql";
import * as mailSender from "@/components/core/server/mailSender";
import puppeteer from "puppeteer";
import bcrypt from "bcryptjs";
import qs from "qs"; // querystring 변환용
import { time } from "console";
import { execSync } from "child_process";
import path from "path";

const executeService = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    switch (jRequest.commandName) {
      case constants.commands.PHARMACY_UPLOAD_DAILY_ORDER:
        jResponse = await uploadDailyOrder(txnId, jRequest);
        break;
      case constants.commands.PHARMACY_VIEW_DAILY_ORDER:
        jResponse = await viewDailyOrder(txnId, jRequest);
        break;
      case constants.commands.PHARMACY_AUTOMATIC_ORDER:
        jResponse = await automaticOrder(txnId, jRequest);
        break;
      case constants.commands.PHARMACY_SUPPLIER_UPSERT_ONE:
        jResponse = await upsertSupplierOne(txnId, jRequest);
        break;
      case constants.commands.PHARMACY_USER_SUPPLIER_SELECT_ALL:
        jResponse = await selectUserSupplierAll(txnId, jRequest);
        break;
      case constants.commands.PHARMACY_SUPPLIER_DELETE_ONE:
        jResponse = await deleteSupplierOne(txnId, jRequest);
        break;
      case constants.commands.PHARMACY_SEARCH_DRUG:
        jResponse = await searchDrug(txnId, jRequest);
        break;
      case constants.commands.PHARMACY_DAILY_ORDER_UPDATE_ONE:
        jResponse = await updateDailyOrderOne(txnId, jRequest);
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

const upsertSupplierOne = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    // 입력 필드값 유효성 검사
    if (jRequest.systemCode !== constants.SystemCode.Pharmacy) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_SYSEM_CODE;
      return jResponse;
    }

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
      return jResponse;
    }

    var sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_COR_USER_MST`,
      1
    );
    var select_TB_COR_USER_MST_01 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.userId,
    ]);

    if (select_TB_COR_USER_MST_01.rowCount != 1) {
      jResponse.error_code = -1;
      jResponse.error_message = `The user not exist.`;
      return jResponse;
    }

    if (
      select_TB_COR_USER_MST_01.rows[0].user_type !==
      constants.UserType.Pharmacy
    ) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_USER_TYPE;
      return jResponse;
    }

    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_PHM_SUPPLIER_INFO`,
      1
    );

    const select_TB_PHM_SUPPLIER_INFO_01 = await database.executeSQL(sql, [
      jRequest.userId,
      jRequest.supplierName,
    ]);

    var isInsert = true;
    if (select_TB_PHM_SUPPLIER_INFO_01.level == "error") {
      jResponse.error_code = -1;
      jResponse.error_message = select_TB_PHM_SUPPLIER_INFO_01.message;
      return jResponse;
    } else {
      if (select_TB_PHM_SUPPLIER_INFO_01.rows.length > 0) {
        isInsert = false;
      }
    }

    var upsert_TB_PHM_SUPPLIER_INFO_01 = null;
    if (isInsert) {
      sql = await dynamicSql.getSQL(
        jRequest.systemCode,
        `insert_TB_PHM_SUPPLIER_INFO`,
        1
      );
      upsert_TB_PHM_SUPPLIER_INFO_01 = await database.executeSQL(sql, [
        jRequest.userId,
        jRequest.supplierName,
        jRequest.parameters,
        jRequest.useFlag,
      ]);
    } else {
      sql = await dynamicSql.getSQL(
        jRequest.systemCode,
        `update_TB_PHM_SUPPLIER_INFO`,
        1
      );
      upsert_TB_PHM_SUPPLIER_INFO_01 = await database.executeSQL(sql, [
        jRequest.userId,
        jRequest.supplierName,
        jRequest.parameters,
        jRequest.useFlag,
      ]);
    }

    if (upsert_TB_PHM_SUPPLIER_INFO_01.rowCount == 1) {
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.SUCCESS_FINISHED;
    } else {
      jResponse.error_code = -3;
      jResponse.error_message = `Failed to add supplier.\n`;
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const deleteSupplierOne = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    // 입력 필드값 유효성 검사
    if (jRequest.systemCode !== constants.SystemCode.Pharmacy) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_SYSEM_CODE;
      return jResponse;
    }

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
      return jResponse;
    }

    var sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_COR_USER_MST`,
      1
    );
    var select_TB_COR_USER_MST_01 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.userId,
    ]);

    if (select_TB_COR_USER_MST_01.rowCount != 1) {
      jResponse.error_code = -1;
      jResponse.error_message = `The user not exist.`;
      return jResponse;
    }

    if (
      select_TB_COR_USER_MST_01.rows[0].user_type !==
      constants.UserType.Pharmacy
    ) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_USER_TYPE;
      return jResponse;
    }

    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_PHM_SUPPLIER_INFO`,
      1
    );

    const select_TB_PHM_SUPPLIER_INFO_01 = await database.executeSQL(sql, [
      jRequest.userId,
      jRequest.supplierName,
    ]);

    var isInsert = true;
    if (select_TB_PHM_SUPPLIER_INFO_01.level == "error") {
      jResponse.error_code = -1;
      jResponse.error_message = select_TB_PHM_SUPPLIER_INFO_01.message;
      return jResponse;
    } else {
      if (select_TB_PHM_SUPPLIER_INFO_01.rows.length == 0) {
        jResponse.error_code = -1;
        jResponse.error_message = constants.messages.NO_DATA_FOUND;
        return jResponse;
      }
    }

    var delete_TB_PHM_SUPPLIER_INFO_01 = null;

    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `delete_TB_PHM_SUPPLIER_INFO`,
      1
    );
    delete_TB_PHM_SUPPLIER_INFO_01 = await database.executeSQL(sql, [
      jRequest.userId,
      jRequest.supplierName,
    ]);

    if (delete_TB_PHM_SUPPLIER_INFO_01.rowCount == 1) {
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.SUCCESS_DELETED;
    } else {
      jResponse.error_code = -3;
      jResponse.error_message = constants.messages.FAILED_TO_DELETE_DATA;
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const selectUserSupplierAll = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    // 입력 필드값 유효성 검사
    if (jRequest.systemCode !== constants.SystemCode.Pharmacy) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_SYSEM_CODE;
      return jResponse;
    }

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
      return jResponse;
    }

    var sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_COR_USER_MST`,
      1
    );
    var select_TB_COR_USER_MST_01 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.userId,
    ]);

    if (select_TB_COR_USER_MST_01.rowCount != 1) {
      jResponse.error_code = -1;
      jResponse.error_message = `The user not exist.`;
      return jResponse;
    }

    if (
      select_TB_COR_USER_MST_01.rows[0].user_type != constants.UserType.Pharmacy
    ) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_USER_TYPE;
      return jResponse;
    }

    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_PHM_SUPPLIER_INFO`,
      2
    );

    const select_TB_PHM_SUPPLIER_INFO_01 = await database.executeSQL(sql, [
      jRequest.userId,
    ]);

    if (select_TB_PHM_SUPPLIER_INFO_01.level == "error") {
      jResponse.error_code = -1;
      jResponse.error_message = select_TB_PHM_DAILY_ORDER_01.message;
    } else {
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.SUCCESS_FINISHED;
      jResponse.data = select_TB_PHM_SUPPLIER_INFO_01;
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const uploadDailyOrder = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    // 입력 필드값 유효성 검사
    if (jRequest.systemCode !== constants.SystemCode.Pharmacy) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_SYSEM_CODE;
      return jResponse;
    }

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
      return jResponse;
    }

    var sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_COR_USER_MST`,
      1
    );
    var select_TB_COR_USER_MST_01 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.userId,
    ]);

    if (select_TB_COR_USER_MST_01.rowCount != 1) {
      jResponse.error_code = -1;
      jResponse.error_message = `The user not exist.`;
      return jResponse;
    }

    if (
      select_TB_COR_USER_MST_01.rows[0].user_type != constants.UserType.Pharmacy
    ) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_USER_TYPE;
      return jResponse;
    }

    const uploadHour = jRequest.uploadHour;

    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `insert_TB_PHM_DAILY_ORDER`,
      1
    );

    for (const row of jRequest.excelData) {
      const insert_TB_PHM_DAILY_ORDER_01 = await database.executeSQL(sql, [
        jRequest.userId,
        uploadHour,
        row.productCode,
        row.productName,
        row.supplierName,
        row.orderQty,
        row.currentInventory,
      ]);
    }
    jResponse.error_code = 0;
    jResponse.error_message = constants.messages.SUCCESS_SAVED;
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const viewDailyOrder = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    // 입력 필드값 유효성 검사
    if (jRequest.systemCode !== constants.SystemCode.Pharmacy) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_SYSEM_CODE;
      return jResponse;
    }

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
      return jResponse;
    }

    var sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_COR_USER_MST`,
      1
    );
    var select_TB_COR_USER_MST_01 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.userId,
    ]);

    if (select_TB_COR_USER_MST_01.rowCount != 1) {
      jResponse.error_code = -1;
      jResponse.error_message = `The user not exist.`;
      return jResponse;
    }

    if (
      select_TB_COR_USER_MST_01.rows[0].user_type != constants.UserType.Pharmacy
    ) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_USER_TYPE;
      return jResponse;
    }

    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_PHM_DAILY_ORDER`,
      1
    );

    const select_TB_PHM_DAILY_ORDER_01 = await database.executeSQL(sql, [
      jRequest.userId,
      jRequest.orderDate,
      jRequest.supplierName ?? constants.General.EmptyString,
    ]);

    if (select_TB_PHM_DAILY_ORDER_01.level == "error") {
      jResponse.error_code = -1;
      jResponse.error_message = select_TB_PHM_DAILY_ORDER_01.message;
    } else {
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.SUCCESS_FINISHED;
      jResponse.data = select_TB_PHM_DAILY_ORDER_01;
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const automaticOrder = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    jResponse.commandName = jRequest.commandName;

    // ===== 기본 검증 =====
    if (jRequest.systemCode !== constants.SystemCode.Pharmacy) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_SYSEM_CODE;
      return jResponse;
    }

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
      return jResponse;
    }

    // ===== 사용자 조회 =====
    let sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_COR_USER_MST`,
      1
    );
    const userResult = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.userId,
    ]);

    if (userResult.rowCount !== 1) {
      jResponse.error_code = -3;
      jResponse.error_message = `Invalid User`;
      return jResponse;
    }

    const userInfo = userResult.rows[0];

    // 건건이 자동 주문
    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_PHM_DAILY_ORDER`,
      1
    );

    const select_TB_PHM_DAILY_ORDER_01 = await database.executeSQL(sql, [
      jRequest.userId,
      jRequest.orderDate,
      jRequest.supplierName ?? constants.General.EmptyString,
    ]);

    if (select_TB_PHM_DAILY_ORDER_01.level == "error") {
      jResponse.error_code = -1;
      jResponse.error_message = select_TB_PHM_DAILY_ORDER_01.message;
      return jResponse;
    }

    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_PHM_SUPPLIER_INFO`,
      1
    );

    const select_TB_PHM_SUPPLIER_INFO_01 = await database.executeSQL(sql, [
      jRequest.userId,
      jRequest.supplierName,
    ]);

    if (select_TB_PHM_SUPPLIER_INFO_01.rows.length > 0) {
      var result;
      for (const rowSupplierInfo of select_TB_PHM_SUPPLIER_INFO_01.rows) {
        const filteredRows = select_TB_PHM_DAILY_ORDER_01.rows.filter(
          (rowDailyOrder) => {
            const matchStatus = rowDailyOrder.order_status !== "장바구니 전송"; // 완료된 주문은 제외
            const matchSupplier =
              rowDailyOrder.supplier_name === rowSupplierInfo.supplier_name;
            const matchProduct =
              !jRequest.productCode ||
              jRequest.productCode === constants.General.EmptyString
                ? true
                : rowDailyOrder.product_code === jRequest.productCode;

            return matchSupplier && matchProduct && matchStatus;
          }
        );

        result = await runOrderBySupplier(
          jRequest.systemCode,
          jRequest.userId,
          rowSupplierInfo.supplier_name,
          rowSupplierInfo.supplier_params,
          filteredRows
        );
      }
    } else {
      result.error_code = -1;
      result.error_message = `${constants.messages.NO_DATA_FOUND} ${jRequest.userId} ${jRequest.supplierName}`;
    }
    jResponse.error_code = result.error_code;
    jResponse.error_message = result.error_message;
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

async function updateOrderStatus(
  systemCode,
  userId,
  uploadHour,
  productCode,
  supplierName,
  orderStatus
) {
  const sql = await dynamicSql.getSQL(
    systemCode,
    `update_TB_PHM_DAILY_ORDER`,
    1
  );

  const update_TB_PHM_DAILY_ORDER_01 = await database.executeSQL(sql, [
    userId,
    uploadHour,
    productCode,
    supplierName,
    orderStatus,
  ]);

  return update_TB_PHM_DAILY_ORDER_01.rowCount === 1;
}

const searchDrug = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    // 입력 필드값 유효성 검사
    if (jRequest.systemCode !== constants.SystemCode.Pharmacy) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_SYSEM_CODE;
      return jResponse;
    }

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
      return jResponse;
    }

    var sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_COR_USER_MST`,
      1
    );
    var select_TB_COR_USER_MST_01 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.userId,
    ]);

    if (select_TB_COR_USER_MST_01.rowCount != 1) {
      jResponse.error_code = -1;
      jResponse.error_message = `The user not exist.`;
      return jResponse;
    }

    if (
      select_TB_COR_USER_MST_01.rows[0].user_type != constants.UserType.Pharmacy
    ) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_USER_TYPE;
      return jResponse;
    }

    if (!jRequest.searchType) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [searchType]`;
      return jResponse;
    }

    if (!jRequest.searchTerm) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [searchTerm]`;
      return jResponse;
    }

    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_PHM_DRUG_INFO`,
      1
    );

    const select_TB_PHM_DRUG_INFO_01 = await database.executeSQL(sql, [
      jRequest.searchType,
      jRequest.searchTerm,
    ]);

    if (select_TB_PHM_DRUG_INFO_01.level == "error") {
      jResponse.error_code = -1;
      jResponse.error_message = select_TB_PHM_DAILY_ORDER_01.message;
    } else {
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.SUCCESS_FINISHED;
      jResponse.data = select_TB_PHM_DRUG_INFO_01;
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const updateDailyOrderOne = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    jResponse.commanaName = jRequest.commandName;

    // 입력 필드값 유효성 검사
    if (jRequest.systemCode !== constants.SystemCode.Pharmacy) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_SYSEM_CODE;
      return jResponse;
    }

    if (!jRequest.userId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
      return jResponse;
    }

    var sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_COR_USER_MST`,
      1
    );
    var select_TB_COR_USER_MST_01 = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.userId,
    ]);

    if (select_TB_COR_USER_MST_01.rowCount != 1) {
      jResponse.error_code = -1;
      jResponse.error_message = `The user not exist.`;
      return jResponse;
    }

    if (
      select_TB_COR_USER_MST_01.rows[0].user_type !==
      constants.UserType.Pharmacy
    ) {
      jResponse.error_code = -1;
      jResponse.error_message = constants.messages.INVALID_USER_TYPE;
      return jResponse;
    }

    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `select_TB_PHM_DAILY_ORDER`,
      2
    );

    const select_TB_PHM_DAILY_ORDER_02 = await database.executeSQL(sql, [
      jRequest.userId,
      jRequest.uploadHour,
      jRequest.productCode,
    ]);

    // var isInsert = true;
    if (select_TB_PHM_DAILY_ORDER_02.level == "error") {
      jResponse.error_code = -1;
      jResponse.error_message = select_TB_PHM_SUPPLIER_INFO_01.message;
      return jResponse;
    } else {
      if (select_TB_PHM_DAILY_ORDER_02.rows.length == 0) {
        jResponse.error_code = -1;
        jResponse.error_message = constants.messages.NO_DATA_FOUND;
        return jResponse;
      }
    }

    var updata_TB_PHM_DAILY_ORDER_02 = null;

    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      `update_TB_PHM_DAILY_ORDER`,
      2
    );
    updata_TB_PHM_DAILY_ORDER_02 = await database.executeSQL(sql, [
      jRequest.userId,
      jRequest.uploadHour,
      jRequest.productCode,
      jRequest.newProductCode,
      jRequest.newProductName,
      jRequest.newOrderQty,
    ]);

    if (updata_TB_PHM_DAILY_ORDER_02.rowCount == 1) {
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.SUCCESS_FINISHED;
    } else {
      jResponse.error_code = -3;
      jResponse.error_message = `Failed to update order.\n`;
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

export async function runOrderBySupplier(
  systemCode,
  user_id,
  supplierName,
  supplier_params,
  rows
) {
  var ret = { error_code: -1, error_message: constants.messages.EMPTY_STRING };
  try {
    switch (supplierName) {
      case `한신약품`:
        ret = await runHanshinOrder(systemCode, user_id, supplier_params, rows);
        break;
      case `건화약품`:
        ret = await runKeonHwaOrder(systemCode, user_id, supplier_params, rows);
        break;
      case `남신약품`:
        ret = await runNamshinOrder(systemCode, user_id, supplier_params, rows);
        break;
      case `서울지오팜`:
        ret = await runGeoPharmOrder(
          systemCode,
          user_id,
          supplier_params,
          rows,
          "서울"
        );
        break;
      case `지오영네트웍스`:
        ret = await runGeoWebOrder(systemCode, user_id, supplier_params, rows);
        break;
      case `동원헬스케어`:
        ret = await runUPharmMallOrder(
          systemCode,
          user_id,
          supplier_params,
          rows,
          supplierName
        );
        break;
      case `주식회사 브릿지팜`:
        ret = await runBridgePharmOrder(
          systemCode,
          user_id,
          supplier_params,
          rows
        );
        break;
      case `함께하는 약품`:
        ret = await runWithUsOrder(systemCode, user_id, supplier_params, rows);
        break;
      default:
        ret = {
          error_code: -1,
          error_message: constants.messages.SERVER_NOT_SUPPORTED_MODULE,
        };
        break;
    }
  } catch (e) {
    ret = { error_code: -1, error_message: e.message };
    logger.warn(`${JSON.stringify(ret, null, 2)}`);
  }
  return ret;
}

// 한신약품
// https://www.hanshinpharm.com
// 아이디: chif2000
비번: 542500;

const runHanshinOrder = async (systemCode, user_id, supplier_params, rows) => {
  logger.warn(`Start HanshinOrder`);

  const loginUrl = supplier_params.loginUrl;
  const loginId = supplier_params.loginId; // = "chif2000";
  const loginPassword = supplier_params.loginPassword; //= "542500";
  const edgePath = getEdgePath();

  // 브라우저를 보면서 작업내용 확인
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: edgePath, // Edge 경로
    args: [
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-extensions", // ★ 확장 기능 완전 비활성화
      "--disable-popup-blocking",
      "--disable-client-side-phishing-detection", // ★ SafeBrowsing 완전 끄기
      "--disable-features=SafeBrowsing", // ★ 광고/추적 차단 기능 끄기
      "--disable-default-apps",
      "--disable-sync",
      "--disable-web-security",
      "--allow-running-insecure-content",
      "--ignore-certificate-errors",
    ],
  });
  const page = await browser.newPage();

  page.on("requestfailed", (request) => {
    console.log("❌ FAILED:", request.url(), request.failure());
  });

  var lastRowResult = constants.General.EmptyString;

  // 1️⃣ 로그인
  await page.goto(loginUrl, { waitUntil: "domcontentloaded" });
  await page.type("#tx_id", loginId);
  await page.type("#tx_pw", loginPassword);
  await page.evaluate(() => {
    const loginButton = document.querySelector(`a.login`);
    if (loginButton) loginButton.click();
  });

  // 로그인 후 잠시 대기
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const cookies = await page.cookies();
  console.log("쿠키:", cookies);

  if (!cookies || cookies.length <= 0) {
    return {
      error_code: -1,
      error_message: `${constants.messages.FAILED_REQUESTED}`,
    };
  }

  // 2️⃣ 주문/상품조회 페이지 이동
  await page.goto(`${loginUrl}/Service/Order/Order.asp`, {
    waitUntil: "domcontentloaded",
  });

  for (const row of rows) {
    try {
      if (!row.product_code) {
        lastRowResult = "입력 제품 없음";
        throw new Error(lastRowResult); // 입력 제품 없음
      }

      // --- 검색조건 세팅 ---
      await page.select("#so3", "2"); // 조회조건 중 KD코드 선택
      await page.evaluate((kdCode) => {
        document.querySelector("#tx_physic").value = kdCode;
      }, row.product_code);

      // 조회 버튼 클릭
      await page.click("#btn_search2");

      // --- AJAX 로딩 대기: tbody 안에 tr 생길 때까지 ---
      await page.waitForFunction(
        () => document.querySelectorAll(".tbl_list.bdtN tbody tr").length > 0,
        { timeout: 20000 }
      );

      // 렌더링 대기
      await new Promise((resolve) => setTimeout(resolve, 500));

      // --- 조회 결과 파싱 ---
      const searchResultRows = await page.$$eval(
        ".tbl_list.bdtN tbody tr",
        (trs) =>
          trs
            .map((tr) => {
              const kdCode =
                tr.querySelector("td:nth-child(1)")?.innerText.trim() || "";
              const manufacturer =
                tr.querySelector("td:nth-child(2)")?.innerText.trim() || "";
              const productName =
                tr.querySelector("td:nth-child(3)")?.innerText.trim() || "";
              const standard =
                tr.querySelector("td:nth-child(4)")?.innerText.trim() || ""; //규격
              const price =
                tr.querySelector("td:nth-child(6)")?.innerText.trim() || ""; //단가
              const stock =
                tr.querySelector("td:nth-child(7)")?.innerText.trim() || ""; //재고

              return {
                kdCode,
                manufacturer,
                productName,
                standard,
                price,
                stock: tr.querySelector("input[name^='stock_']")?.value || "",
                productId: tr.querySelector("input[name^='pc_']")?.value || "",
                quantityInput:
                  tr.querySelector("input[name^='qty_']")?.id || "",
              };
            })
            .filter((item) => item.stock > 0) // 재고 0 이상만 남김
      );

      console.log(searchResultRows);

      // 조회결과가 1건만 조회되어야 주문 처리 가능 ---
      if (
        searchResultRows.length === 0 ||
        searchResultRows[0].productId === constants.General.EmptyString
      ) {
        lastRowResult = "제품 검색 불가";
        throw new Error(lastRowResult);
      }

      if (searchResultRows.length > 1) {
        lastRowResult = "제품 중복 검색";
        throw new Error(lastRowResult);
      }

      const item = searchResultRows[0];
      const { stock, quantityInput: qtyId } = item;

      const n_stock = Number(item.stock);
      const n_orderQty = Number(row.order_qty);

      if (isNaN(n_stock) || isNaN(n_orderQty)) {
        lastRowResult = "수량 이상";
        throw new Error(lastRowResult);
      }

      if (n_stock <= 0 || n_orderQty > n_stock) {
        lastRowResult = "재고 부족";
        throw new Error(lastRowResult);
      }

      if (qtyId) {
        // 주문수량 입력
        await page.focus(`#${qtyId}`);
        await page.keyboard.type(String(row.order_qty));
      }

      // 장바구니 담기 버튼 클릭
      await page.click("#btn_saveBag");
      await new Promise((resolve) => setTimeout(resolve, 500));

      lastRowResult = "장바구니 전송";
      // 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        lastRowResult
      );
    } catch (e) {
      // 에러코드 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        e.message
      );
    }
  }

  await browser.close();

  var ret;

  ret =
    rows.length != 1
      ? {
          error_code: 0,
          error_message: `${constants.messages.SUCCESS_FINISHED}`,
        }
      : {
          error_code: 0,
          error_message: `${lastRowResult}`,
        };

  logger.warn(`Finished HanshinOrder: ${JSON.stringify(ret, null, 2)}`);
  return ret;
};

// 건화약품
// http://kh-pharm.co.kr
// 아이디 chif2000
// 비번 542500
const runKeonHwaOrder = async (systemCode, user_id, supplier_params, rows) => {
  logger.warn(`Start BridgePharmOrder`);

  if (rows.length === 0) {
    ret = {
      error_code: 0,
      error_message: `${constants.messages.SUCCESS_FINISHED}`,
    };
    return ret;
  }

  const loginUrl = supplier_params.loginUrl;
  const loginId = supplier_params.loginId; // = "chif2000";
  const loginPassword = supplier_params.loginPassword; //= "542500";
  const edgePath = getEdgePath();

  // 브라우저를 보면서 작업내용 확인
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: edgePath, // Edge 경로
    args: [
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-extensions", // ★ 확장 기능 완전 비활성화
      "--disable-popup-blocking",
      "--disable-client-side-phishing-detection", // ★ SafeBrowsing 완전 끄기
      "--disable-features=SafeBrowsing", // ★ 광고/추적 차단 기능 끄기
      "--disable-default-apps",
      "--disable-sync",
      "--disable-web-security",
      "--allow-running-insecure-content",
      "--ignore-certificate-errors",
      "--disable-features=UpgradeHTTPToHTTPS",
    ],
  });
  const page = await browser.newPage();

  page.on("requestfailed", (request) => {
    console.log("❌ FAILED:", request.url(), request.failure());
  });

  var lastRowResult = constants.General.EmptyString;

  // 1️⃣ 로그인
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    // 광고/추적으로 분류되는 요청도 전부 허용
    req.continue();
  });

  await page.evaluateOnNewDocument(() => {
    // alert, confirm, prompt 무력화
    window.alert = () => {};
    window.confirm = () => true;
    window.prompt = () => "";
    // window.open 무력화 (팝업 생성 방지)
    window.open = () => null;
  });
  // 1️⃣ 로그인
  await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

  // 페이지 로드 후
  await page.waitForSelector('input[name="tx_id"]', { visible: true });
  await page.waitForSelector('input[name="tx_pw"]', { visible: true });

  await page.evaluate(
    (id, pw) => {
      // 1. ID/PW 입력
      const idInput = document.querySelector('input[name="tx_id"]');
      const pwInput = document.querySelector('input[name="tx_pw"]');
      idInput.value = id;
      pwInput.value = pw;

      // 2. 이벤트 강제 트리거 (필요 시)
      idInput.dispatchEvent(new Event("input", { bubbles: true }));
      pwInput.dispatchEvent(new Event("input", { bubbles: true }));

      // 3. SendData() 함수 호출 (페이지에 정의됨)
      if (typeof SendData === "function") {
        SendData();
      } else {
        // fallback: form submit
        document.LoginForm.submit();
      }
    },
    loginId,
    loginPassword
  );

  // 로그인 후 페이지 이동 대기
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  const cookies = await page.cookies();
  console.log("쿠키:", cookies);

  if (!cookies || cookies.length <= 0) {
    return {
      error_code: -1,
      error_message: `${constants.messages.FAILED_REQUESTED}`,
    };
  }

  // 2️⃣ 주문/상품조회 페이지 이동
  await page.goto(`${loginUrl}/Service/Order/Order.asp`, {
    waitUntil: "domcontentloaded",
  });

  for (const row of rows) {
    try {
      if (!row.product_code) {
        lastRowResult = "입력 제품 없음";
        throw new Error(lastRowResult); // 입력 제품 없음
      }

      // --- 검색조건 세팅 ---
      await page.select("#so3", "2"); // 조회조건 중 KD코드 선택
      await page.evaluate((kdCode) => {
        document.querySelector("#tx_physic").value = kdCode;
      }, row.product_code);

      // 조회 버튼 클릭
      await page.click("#btn_search2");

      // --- AJAX 로딩 대기: tbody 안에 tr 생길 때까지 ---
      await page.waitForFunction(
        () => document.querySelectorAll(".tbl_list.bdtN tbody tr").length > 0,
        { timeout: 20000 }
      );

      // 렌더링 대기
      await new Promise((resolve) => setTimeout(resolve, 500));

      // --- 조회 결과 파싱 ---
      const searchResultRows = await page.$$eval(
        ".tbl_list.bdtN tbody tr",
        (trs) =>
          trs
            .map((tr) => {
              const kdCode =
                tr.querySelector("td:nth-child(1)")?.innerText.trim() || "";
              const manufacturer =
                tr.querySelector("td:nth-child(2)")?.innerText.trim() || "";
              const productName =
                tr.querySelector("td:nth-child(3)")?.innerText.trim() || "";
              const standard =
                tr.querySelector("td:nth-child(4)")?.innerText.trim() || ""; //규격
              const price =
                tr.querySelector("td:nth-child(6)")?.innerText.trim() || ""; //단가
              const stock =
                tr.querySelector("td:nth-child(7)")?.innerText.trim() || ""; //재고

              return {
                kdCode,
                manufacturer,
                productName,
                standard,
                price,
                stock: tr.querySelector("input[name^='stock_']")?.value || "",
                productId: tr.querySelector("input[name^='pc_']")?.value || "",
                quantityInput:
                  tr.querySelector("input[name^='qty_']")?.id || "",
              };
            })
            .filter((item) => item.stock > 0) // 재고 0 이상만 남김
      );

      console.log(searchResultRows);

      // 조회결과가 1건만 조회되어야 주문 처리 가능 ---
      if (
        searchResultRows.length === 0 ||
        searchResultRows[0].productId === constants.General.EmptyString
      ) {
        lastRowResult = "제품 검색 불가";
        throw new Error(lastRowResult);
      }

      if (searchResultRows.length > 1) {
        lastRowResult = "제품 중복 검색";
        throw new Error(lastRowResult);
      }

      const item = searchResultRows[0];
      const { stock, quantityInput: qtyId } = item;

      const n_stock = Number(item.stock);
      const n_orderQty = Number(row.order_qty);

      if (isNaN(n_stock) || isNaN(n_orderQty)) {
        lastRowResult = "수량 이상";
        throw new Error(lastRowResult);
      }

      if (n_stock <= 0 || n_orderQty > n_stock) {
        lastRowResult = "재고 부족";
        throw new Error(lastRowResult);
      }

      if (qtyId) {
        // 주문수량 입력
        await page.focus(`#${qtyId}`);
        await page.keyboard.type(String(row.order_qty));
      }

      // 장바구니 담기 버튼 클릭
      await page.click("#btn_saveBag");
      await new Promise((resolve) => setTimeout(resolve, 500));

      lastRowResult = "장바구니 전송";
      // 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        lastRowResult
      );
    } catch (e) {
      // 에러코드 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        e.message
      );
    }
  }

  await browser.close();

  var ret;

  ret =
    rows.length != 1
      ? {
          error_code: 0,
          error_message: `${constants.messages.SUCCESS_FINISHED}`,
        }
      : {
          error_code: 0,
          error_message: `${lastRowResult}`,
        };

  logger.warn(`Finished HanshinOrder: ${JSON.stringify(ret, null, 2)}`);
  return ret;
};

//남신약품
// http://namsinp.com/Contents/Main/Main0.asp
// 아이디 chif2000
// 비번 542500
const runNamshinOrder = async (systemCode, user_id, supplier_params, rows) => {
  logger.warn(`Start NamshinOrder`);

  const loginUrl = supplier_params.loginUrl;
  const loginId = supplier_params.loginId; // = "chif2000";
  const loginPassword = supplier_params.loginPassword; //= "542500";
  const edgePath = getEdgePath();

  // 브라우저를 보면서 작업내용 확인
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: edgePath, // Edge 경로
    args: [
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-extensions", // ★ 확장 기능 완전 비활성화
      "--disable-popup-blocking",
      "--disable-client-side-phishing-detection", // ★ SafeBrowsing 완전 끄기
      "--disable-features=SafeBrowsing", // ★ 광고/추적 차단 기능 끄기
      "--disable-default-apps",
      "--disable-sync",
      "--disable-web-security",
      "--allow-running-insecure-content",
      "--ignore-certificate-errors",
      "--disable-features=UpgradeHTTPToHTTPS",
    ],
  });
  const page = await browser.newPage();

  page.on("requestfailed", (request) => {
    console.log("❌ FAILED:", request.url(), request.failure());
  });

  var lastRowResult = constants.General.EmptyString;

  // 1️⃣ 로그인
  await page.goto(loginUrl, { waitUntil: "domcontentloaded" });
  await page.type("#tx_id", loginId);
  await page.type("#tx_pw", loginPassword);
  await page.evaluate(() => {
    const loginButton = document.querySelector(`a.login`);
    if (loginButton) loginButton.click();
  });

  // 로그인 후 잠시 대기
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const cookies = await page.cookies();
  console.log("쿠키:", cookies);

  if (!cookies || cookies.length <= 0) {
    return {
      error_code: -1,
      error_message: `${constants.messages.FAILED_REQUESTED}`,
    };
  }

  // 2️⃣ 주문/상품조회 페이지 이동
  await page.goto(`${loginUrl}/Service/Order/Order.asp`, {
    waitUntil: "domcontentloaded",
  });

  for (const row of rows) {
    try {
      if (!row.product_code) {
        lastRowResult = "입력 제품 없음";
        throw new Error(lastRowResult); // 입력 제품 없음
      }

      // --- 검색조건 세팅 ---
      await page.select("#so3", "2"); // 조회조건 중 KD코드 선택
      await page.evaluate((kdCode) => {
        document.querySelector("#tx_physic").value = kdCode;
      }, row.product_code);

      // 조회 버튼 클릭
      await page.click("#btn_search2");

      // --- AJAX 로딩 대기: tbody 안에 tr 생길 때까지 ---
      await page.waitForFunction(
        () => document.querySelectorAll(".tbl_list.bdtN tbody tr").length > 0,
        { timeout: 20000 }
      );

      // 렌더링 대기
      await new Promise((resolve) => setTimeout(resolve, 500));

      // --- 조회 결과 파싱 ---
      const searchResultRows = await page.$$eval(
        ".tbl_list.bdtN tbody tr",
        (trs) =>
          trs
            .map((tr) => {
              const kdCode =
                tr.querySelector("td:nth-child(1)")?.innerText.trim() || "";
              const manufacturer =
                tr.querySelector("td:nth-child(2)")?.innerText.trim() || "";
              const productName =
                tr.querySelector("td:nth-child(3)")?.innerText.trim() || "";
              const standard =
                tr.querySelector("td:nth-child(4)")?.innerText.trim() || ""; //규격
              const price =
                tr.querySelector("td:nth-child(6)")?.innerText.trim() || ""; //단가
              const stock =
                tr.querySelector("td:nth-child(7)")?.innerText.trim() || ""; //재고

              return {
                kdCode,
                manufacturer,
                productName,
                standard,
                price,
                stock: tr.querySelector("input[name^='stock_']")?.value || "",
                productId: tr.querySelector("input[name^='pc_']")?.value || "",
                quantityInput:
                  tr.querySelector("input[name^='qty_']")?.id || "",
              };
            })
            .filter((item) => item.stock > 0) // 재고 0 이상만 남김
      );

      console.log(searchResultRows);

      // 조회결과가 1건만 조회되어야 주문 처리 가능 ---
      if (
        searchResultRows.length === 0 ||
        searchResultRows[0].productId === constants.General.EmptyString
      ) {
        lastRowResult = "제품 검색 불가";
        throw new Error(lastRowResult);
      }

      if (searchResultRows.length > 1) {
        lastRowResult = "제품 중복 검색";
        throw new Error(lastRowResult);
      }

      const item = searchResultRows[0];
      const { stock, quantityInput: qtyId } = item;

      const n_stock = Number(item.stock);
      const n_orderQty = Number(row.order_qty);

      if (isNaN(n_stock) || isNaN(n_orderQty)) {
        lastRowResult = "수량 이상";
        throw new Error(lastRowResult);
      }

      if (n_stock <= 0 || n_orderQty > n_stock) {
        lastRowResult = "재고 부족";
        throw new Error(lastRowResult);
      }

      if (qtyId) {
        // 주문수량 입력
        await page.focus(`#${qtyId}`);
        await page.keyboard.type(String(row.order_qty));
      }

      // 장바구니 담기 버튼 클릭
      await page.click("#btn_saveBag");
      await new Promise((resolve) => setTimeout(resolve, 500));

      lastRowResult = "장바구니 전송";
      // 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        lastRowResult
      );
    } catch (e) {
      // 에러코드 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        e.message
      );
    }
  }

  await browser.close();

  var ret;

  ret =
    rows.length != 1
      ? {
          error_code: 0,
          error_message: `${constants.messages.SUCCESS_FINISHED}`,
        }
      : {
          error_code: 0,
          error_message: `${lastRowResult}`,
        };

  logger.warn(`Finished HanshinOrder: ${JSON.stringify(ret, null, 2)}`);
  return ret;
};

// 유팜몰(동원헬스케어)
// https://www.upharmmall.co.kr
// 아이디 chif2000
// 비번 5425abcd
const runUPharmMallOrder = async (
  systemCode,
  user_id,
  supplier_params,
  rows,
  supplierName
) => {
  logger.warn(`Start UPharmMallOrder`);

  if (rows.length === 0) {
    ret = {
      error_code: 0,
      error_message: `${constants.messages.SUCCESS_FINISHED}`,
    };
    return ret;
  }

  const loginUrl = supplier_params.loginUrl;
  const loginId = supplier_params.loginId; // = "chif2000";
  const loginPassword = supplier_params.loginPassword; //= "542500";
  const edgePath = getEdgePath();

  // 브라우저를 보면서 작업내용 확인
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: edgePath, // Edge 경로
    args: [
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-extensions", // ★ 확장 기능 완전 비활성화
      "--disable-popup-blocking",
      "--disable-client-side-phishing-detection", // ★ SafeBrowsing 완전 끄기
      "--disable-features=SafeBrowsing", // ★ 광고/추적 차단 기능 끄기
      "--disable-default-apps",
      "--disable-sync",
      "--disable-web-security",
      "--allow-running-insecure-content",
      "--ignore-certificate-errors",
    ],
  });
  const page = await browser.newPage();

  page.on("requestfailed", (request) => {
    console.log("❌ FAILED:", request.url(), request.failure());
  });

  var lastRowResult = constants.General.EmptyString;

  // 1️⃣ 로그인
  await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

  await page.type("#ctl00_HeaderControl_txtTopUserID", loginId);
  await page.type("#ctl00_HeaderControl_txtTopPwd", loginPassword);

  // 로그인 전 잠시 대기
  await page.waitForSelector('input[type="submit"][value="로그인"]');
  // 로그인 버튼 클릭 후 페이지 로딩 대기
  await page.click("#ctl00_HeaderControl_ibtnTopLogin");
  await page.waitForNavigation({ waitUntil: "load" }); // 페이지 로딩 대기

  const cookies = await page.cookies();
  console.log("쿠키:", cookies);

  if (!cookies || cookies.length <= 0) {
    return {
      error_code: -1,
      error_message: `${constants.messages.FAILED_REQUESTED}`,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  page.waitForNavigation();

  // 2️⃣ 주문/상품조회 페이지 이동 (동원헬스케어)
  switch (supplierName) {
    case "동원헬스케어":
      await page.click("a[onclick^='fnMemberChange']");
      break;
    default:
      return {
        error_code: -1,
        error_message: `${constants.messages.SERVER_NOT_SUPPORTED_MODULE}`,
      };
  }

  for (const row of rows) {
    try {
      if (!row.product_code) {
        lastRowResult = "입력 제품 없음";
        throw new Error(lastRowResult); // 입력 제품 없음
      }

      // --- 검색조건 세팅 ---
      await page.waitForSelector("#itemName", { visible: true });

      // 2) 검색어 입력
      await page.click("#itemName", { clickCount: 3 }); // 기존 값 지우기
      await page.type("#itemName", row.product_code);

      // 3) 검색 버튼 클릭
      await page.click("#btnSearch");

      // 4) 검색 결과 테이블 로딩 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 1) 테이블 로딩 대기
      await page.waitForSelector("#list1 tbody");

      // 2) 모든 row 데이터 배열로 추출
      const rowsResult = await page.$$eval("#list1 tbody tr", (rows) => {
        return rows.map((row) => {
          const tds = row.querySelectorAll("td");
          const stockHidden = row.querySelector("input[id^='stocQty']"); // hidden input에서 재고
          const stockQty = stockHidden
            ? parseInt(stockHidden.value.trim().replace(/,/g, ""), 10)
            : 0;
          if (stockQty > 0) {
            return {
              insuranceCode: tds[0]?.innerText.trim() || "",
              manufacturer: tds[1]?.innerText.trim() || "",
              productName: tds[2]?.innerText.trim() || "",
              standard: tds[4]?.innerText.trim() || "",
              price: tds[5]?.innerText.trim() || "",
              stock: stockHidden
                ? parseInt(stockHidden.value.trim().replace(/,/g, ""), 10)
                : 0,
              orderInputId: tds[7]?.querySelector("input")?.id || null,
            };
          }
        });
      });

      // 3) 결과 체크
      if (rowsResult.length === 0) {
        lastRowResult = "제품 검색 불가";
        throw new Error(lastRowResult); // 입력 제품 없음
      } else if (rowsResult.length > 1) {
        lastRowResult = "제품 중복 검색";
        throw new Error(lastRowResult); // 입력 제품 없음
      }

      //
      // 2. 재고 체크
      //
      if (row.order_qty > rowsResult[0].stock) {
        lastRowResult = "재고 부족";
        throw new Error(lastRowResult);
      }

      // 3. 주문수량 입력
      const firstRow = await page.$("#list1 tbody tr:first-child");

      // 2) 첫 번째 row의 주문수량 input 가져오기
      const orderInput = await firstRow.$("input[id^='orderQty']");
      await orderInput.click({ clickCount: 3 }); // 기존 값 지우기
      await orderInput.type(`${row.order_qty}`);

      // 주문담기 버튼 클릭
      const cartBtn = await firstRow.$('button, input[type="button"]');
      if (!cartBtn) {
        throw new Error("첫 번째 행에서 장바구니 버튼을 찾지 못했습니다.");
      }

      // 4) 버튼 클릭
      await cartBtn.click();

      lastRowResult = "장바구니 전송";

      // 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        lastRowResult
      );
    } catch (e) {
      // 에러코드 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        e.message
      );
    }
  }

  await browser.close();

  var ret;

  ret =
    rows.length != 1
      ? {
          error_code: 0,
          error_message: `${constants.messages.SUCCESS_FINISHED}`,
        }
      : {
          error_code: 0,
          error_message: `${lastRowResult}`,
        };

  logger.warn(`Finished HanshinOrder: ${JSON.stringify(ret, null, 2)}`);
  return ret;
};

// (주) 훼밀리팜
// http://family-pharm.co.kr
// 아이디 chif2000
// 비번 542500

// (주)함께하는약품
// http://withus2022.com
// 아이디 chif2000
// 비번 542500
const runWithUsOrder = async (systemCode, user_id, supplier_params, rows) => {
  logger.warn(`Start BridgePharmOrder`);

  if (rows.length === 0) {
    ret = {
      error_code: 0,
      error_message: `${constants.messages.SUCCESS_FINISHED}`,
    };
    return ret;
  }

  const loginUrl = supplier_params.loginUrl;
  const loginId = supplier_params.loginId; // = "chif2000";
  const loginPassword = supplier_params.loginPassword; //= "542500";
  const edgePath = getEdgePath();

  // 브라우저를 보면서 작업내용 확인
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: edgePath, // Edge 경로
    args: [
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-extensions", // ★ 확장 기능 완전 비활성화
      "--disable-popup-blocking",
      "--disable-client-side-phishing-detection", // ★ SafeBrowsing 완전 끄기
      "--disable-features=SafeBrowsing", // ★ 광고/추적 차단 기능 끄기
      "--disable-default-apps",
      "--disable-sync",
      "--disable-web-security",
      "--allow-running-insecure-content",
      "--ignore-certificate-errors",
      "--disable-features=UpgradeHTTPToHTTPS",
    ],
  });
  const page = await browser.newPage();

  page.on("requestfailed", (request) => {
    console.log("❌ FAILED:", request.url(), request.failure());
  });

  var lastRowResult = constants.General.EmptyString;

  // 1️⃣ 로그인
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    // 광고/추적으로 분류되는 요청도 전부 허용
    req.continue();
  });

  await page.evaluateOnNewDocument(() => {
    // alert, confirm, prompt 무력화
    window.alert = () => {};
    window.confirm = () => true;
    window.prompt = () => "";
    // window.open 무력화 (팝업 생성 방지)
    window.open = () => null;
  });
  // 1️⃣ 로그인
  await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

  await page.waitForSelector("#tx_id", { visible: true });

  await page.type("#tx_id", loginId);
  await page.type("#tx_pw", loginPassword);
  await page.evaluate(() => {
    const loginButton = document.querySelector(`a.login`);
    if (loginButton) loginButton.click();
  });

  // 로그인 후 잠시 대기
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const cookies = await page.cookies();
  console.log("쿠키:", cookies);

  if (!cookies || cookies.length <= 0) {
    return {
      error_code: -1,
      error_message: `${constants.messages.FAILED_REQUESTED}`,
    };
  }

  // 2️⃣ 주문/상품조회 페이지 이동
  await page.goto(`${loginUrl}/Service/Order/Order.asp`, {
    waitUntil: "domcontentloaded",
  });

  for (const row of rows) {
    try {
      if (!row.product_code) {
        lastRowResult = "입력 제품 없음";
        throw new Error(lastRowResult); // 입력 제품 없음
      }

      // --- 검색조건 세팅 ---
      await page.select("#so3", "2"); // 조회조건 중 KD코드 선택
      await page.evaluate((kdCode) => {
        document.querySelector("#tx_physic").value = kdCode;
      }, row.product_code);

      // 조회 버튼 클릭
      await page.click("#btn_search2");

      // --- AJAX 로딩 대기: tbody 안에 tr 생길 때까지 ---
      await page.waitForFunction(
        () => document.querySelectorAll(".tbl_list.bdtN tbody tr").length > 0,
        { timeout: 20000 }
      );

      // 렌더링 대기
      await new Promise((resolve) => setTimeout(resolve, 500));

      // --- 조회 결과 파싱 ---
      const searchResultRows = await page.$$eval(
        ".tbl_list.bdtN tbody tr",
        (trs) =>
          trs
            .map((tr) => {
              const kdCode =
                tr.querySelector("td:nth-child(1)")?.innerText.trim() || "";
              const manufacturer =
                tr.querySelector("td:nth-child(2)")?.innerText.trim() || "";
              const productName =
                tr.querySelector("td:nth-child(3)")?.innerText.trim() || "";
              const standard =
                tr.querySelector("td:nth-child(4)")?.innerText.trim() || ""; //규격
              const price =
                tr.querySelector("td:nth-child(6)")?.innerText.trim() || ""; //단가
              const stock =
                tr.querySelector("td:nth-child(7)")?.innerText.trim() || ""; //재고

              return {
                kdCode,
                manufacturer,
                productName,
                standard,
                price,
                stock: tr.querySelector("input[name^='stock_']")?.value || "",
                productId: tr.querySelector("input[name^='pc_']")?.value || "",
                quantityInput:
                  tr.querySelector("input[name^='qty_']")?.id || "",
              };
            })
            .filter((item) => item.stock > 0) // 재고 0 이상만 남김
      );

      console.log(searchResultRows);

      // 조회결과가 1건만 조회되어야 주문 처리 가능 ---
      if (
        searchResultRows.length === 0 ||
        searchResultRows[0].productId === constants.General.EmptyString
      ) {
        lastRowResult = "제품 검색 불가";
        throw new Error(lastRowResult);
      }

      if (searchResultRows.length > 1) {
        lastRowResult = "제품 중복 검색";
        throw new Error(lastRowResult);
      }

      const item = searchResultRows[0];
      const { stock, quantityInput: qtyId } = item;

      const n_stock = Number(item.stock);
      const n_orderQty = Number(row.order_qty);

      if (isNaN(n_stock) || isNaN(n_orderQty)) {
        lastRowResult = "수량 이상";
        throw new Error(lastRowResult);
      }

      if (n_stock <= 0 || n_orderQty > n_stock) {
        lastRowResult = "재고 부족";
        throw new Error(lastRowResult);
      }

      if (qtyId) {
        // 주문수량 입력
        await page.focus(`#${qtyId}`);
        await page.keyboard.type(String(row.order_qty));
      }

      // 장바구니 담기 버튼 클릭
      await page.click("#btn_saveBag");
      await new Promise((resolve) => setTimeout(resolve, 500));

      lastRowResult = "장바구니 전송";
      // 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        lastRowResult
      );
    } catch (e) {
      // 에러코드 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        e.message
      );
    }
  }

  await browser.close();

  var ret;

  ret =
    rows.length != 1
      ? {
          error_code: 0,
          error_message: `${constants.messages.SUCCESS_FINISHED}`,
        }
      : {
          error_code: 0,
          error_message: `${lastRowResult}`,
        };

  logger.warn(`Finished HanshinOrder: ${JSON.stringify(ret, null, 2)}`);
  return ret;
};

// 지오팜 약국주문 시스템
// https://orderpharm.geo-pharm.com
// 아이디 chif2000
// 비번 542500
const runGeoPharmOrder = async (
  systemCode,
  user_id,
  supplier_params,
  rows,
  loginArea
) => {
  logger.warn(`Start GeoPharmOrder`);

  if (rows.length === 0) {
    ret = {
      error_code: 0,
      error_message: `${constants.messages.SUCCESS_FINISHED}`,
    };
    return ret;
  }

  const loginUrl = supplier_params.loginUrl;
  const loginId = supplier_params.loginId; // = "chif2000";
  const loginPassword = supplier_params.loginPassword; //= "542500";
  const edgePath = getEdgePath();

  // 브라우저를 보면서 작업내용 확인
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: edgePath, // Edge 경로
    args: [
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-extensions", // ★ 확장 기능 완전 비활성화
      "--disable-popup-blocking",
      "--disable-client-side-phishing-detection", // ★ SafeBrowsing 완전 끄기
      "--disable-features=SafeBrowsing", // ★ 광고/추적 차단 기능 끄기
      "--disable-default-apps",
      "--disable-sync",
      "--disable-web-security",
      "--allow-running-insecure-content",
      "--ignore-certificate-errors",
    ],
  });
  const page = await browser.newPage();

  page.on("requestfailed", (request) => {
    console.log("❌ FAILED:", request.url(), request.failure());
  });

  var lastRowResult = constants.General.EmptyString;

  // 1️⃣ 로그인
  await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

  await page.waitForSelector("#loginarea");
  const options = await page.evaluate(() => {
    const opts = Array.from(document.querySelectorAll("#loginarea option"));
    return opts.map((option) => ({
      value: option.value,
      text: option.textContent.trim(),
    }));
  });
  const targetOption = options.find((option) => option.text === loginArea);
  if (targetOption) {
    await page.select("#loginarea", targetOption.value);
  }

  await page.type("#user_id", loginId);
  await page.type("#user_pwd", loginPassword);

  // 로그인 전 잠시 대기
  await page.waitForSelector('input[type="submit"][value="로그인"]');
  await page.evaluate(() => {
    document.querySelector("form").submit();
  });

  const cookies = await page.cookies();
  console.log("쿠키:", cookies);

  if (!cookies || cookies.length <= 0) {
    return {
      error_code: -1,
      error_message: `${constants.messages.FAILED_REQUESTED}`,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 2️⃣ 주문/상품조회 페이지 이동
  await page.goto(`${loginUrl}/pharmorder/order.php`, {
    waitUntil: "domcontentloaded",
  });

  page.waitForNavigation();

  for (const row of rows) {
    try {
      if (!row.product_code) {
        lastRowResult = "입력 제품 없음";
        throw new Error(lastRowResult); // 입력 제품 없음
      }

      // --- 검색조건 세팅 ---
      // await page.select("#so3", "2"); // 조회조건 중 KD코드 선택
      await page.evaluate((kdCode) => {
        document.querySelector("#item_name").value = kdCode;
      }, row.product_code);

      // 조회 버튼 클릭
      await page.evaluate(() => {
        const form = document.querySelector("form");
        form.submit();
      });

      await page.waitForNavigation({ waitUntil: "domcontentloaded" });

      // --- AJAX 로딩 대기: tbody 안에 tr 생길 때까지 ---

      const iframeElement = await page.$("#order_item_view_iframe");
      const iframe = await iframeElement.contentFrame();

      // 주문수량 입력
      // 2) 프레임 내부 DOM에서 '재고수량' th 옆 td 의 텍스트(숫자) 읽기
      const stockQtyText = await iframe.evaluate(() => {
        // 모든 th를 검사해서 '재고수량' 텍스트를 포함하는 th를 찾음
        const ths = Array.from(document.querySelectorAll("th"));
        const targetTh = ths.find(
          (t) => t.textContent && t.textContent.trim().includes("재고수량")
        );
        if (!targetTh) return null;

        // 바로 다음 형제 td (재고 수량)
        const stockTd = targetTh.nextElementSibling;
        return stockTd ? stockTd.textContent.trim() : null;
      });

      if (stockQtyText == null) {
        throw new Error("프레임 내부에서 '재고수량' td를 찾지 못했습니다.");
      }

      // 숫자만 뽑아서 Number 변환 (예: "4,100" 처리)
      const stockQty = Number(stockQtyText.replace(/[^0-9]/g, ""));
      if (Number.isNaN(stockQty)) {
        throw new Error(
          `재고수량을 숫자로 변환할 수 없습니다: "${stockQtyText}"`
        );
      }

      const orderQtyInput = Number(row.order_qty);

      //
      // 2. 재고 체크
      //
      if (orderQtyInput > stockQty) {
        lastRowResult = "재고 부족";
        throw new Error(lastRowResult);
      }

      await iframe.waitForSelector(`#item_order_count`, {
        visible: true,
        timeout: 30000,
      });

      await iframe.type(`#item_order_count`, `${orderQtyInput}`);

      // 주문담기 버튼 클릭
      await iframe.click("#btn_add_cart");
      lastRowResult = "장바구니 전송";

      // 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        lastRowResult
      );
    } catch (e) {
      // 에러코드 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        e.message
      );
    }
  }

  await browser.close();

  var ret;

  ret =
    rows.length != 1
      ? {
          error_code: 0,
          error_message: `${constants.messages.SUCCESS_FINISHED}`,
        }
      : {
          error_code: 0,
          error_message: `${lastRowResult}`,
        };

  logger.warn(`Finished HanshinOrder: ${JSON.stringify(ret, null, 2)}`);
  return ret;
};

// 지오웹
// https://order.geoweb.kr
// 아이디 chif2000
// 비번 1234abcd
const runGeoWebOrder = async (systemCode, user_id, supplier_params, rows) => {
  logger.warn(`Start GeoWebOrder`);

  if (rows.length === 0) {
    ret = {
      error_code: 0,
      error_message: `${constants.messages.SUCCESS_FINISHED}`,
    };
    return ret;
  }

  const loginUrl = supplier_params.loginUrl;
  const loginId = supplier_params.loginId; // = "chif2000";
  const loginPassword = supplier_params.loginPassword; //= "542500";
  const edgePath = getEdgePath();

  // 브라우저를 보면서 작업내용 확인
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: edgePath, // Edge 경로
    args: [
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-extensions", // ★ 확장 기능 완전 비활성화
      "--disable-popup-blocking",
      "--disable-client-side-phishing-detection", // ★ SafeBrowsing 완전 끄기
      "--disable-features=SafeBrowsing", // ★ 광고/추적 차단 기능 끄기
      "--disable-default-apps",
      "--disable-sync",
      "--disable-web-security",
      "--allow-running-insecure-content",
      "--ignore-certificate-errors",
    ],
  });

  page.on("requestfailed", (request) => {
    console.log("❌ FAILED:", request.url(), request.failure());
  });

  const page = await browser.newPage();
  var lastRowResult = constants.General.EmptyString;

  // 1️⃣ 로그인
  await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

  await page.type("#LoginID", loginId);
  await page.type("#Password", loginPassword);
  await page.click("button.btn_login");

  // 로그인 후 잠시 대기
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const cookies = await page.cookies();
  console.log("쿠키:", cookies);

  if (!cookies || cookies.length <= 0) {
    return {
      error_code: -1,
      error_message: `${constants.messages.FAILED_REQUESTED}`,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 팝업 닫기 시도
  try {
    await page.waitForSelector("button.btn_close", { timeout: 2000 });
    await page.click("button.btn_close");
  } catch (e) {
    // 팝업이 없어도 에러 안나도록 무시
  }

  // 2️⃣ 주문/상품조회 페이지

  for (const row of rows) {
    try {
      if (!row.product_code) {
        lastRowResult = "입력 제품 없음";
        throw new Error(lastRowResult);
      }

      // --- 검색조건 세팅 ---
      await page.evaluate((kdCode) => {
        document.querySelector("#txt_product").value = kdCode;
      }, row.product_code);

      // 조회 버튼 클릭
      // await page.waitForSelector("btn_main_search", { timeout: 2000 });
      await page.click("#btn_main_search");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 팝업 닫기 시도
      try {
        await page.waitForSelector("button.btn_close", { timeout: 2000 });
        await page.click("button.btn_close");
      } catch (e) {
        // 팝업이 없어도 에러 안나도록 무시
      }

      const rowsResult = await page.$$eval("tr.tr-product-list", (rows) => {
        return rows
          .map((row) => {
            const tds = row.querySelectorAll("td");

            const stock = parseInt(tds[5].innerText.trim(), 10); // 재고 TD = index 5

            if (stock > 0) {
              return {
                code: tds[1].innerText.trim(), // 보험코드
                company: tds[2].innerText.trim(), // 제약사
                name: tds[3].innerText.trim(), // 제품명
                standard: tds[4].innerText.trim(), // 규격
                stock: stock, // 재고
              };
            }
            return null;
          })
          .filter((item) => item !== null);
      });

      if (rowsResult.length === 0) {
        lastRowResult = "제품 검색 불가";
        throw new Error(lastRowResult);
      }

      if (rowsResult.length > 1) {
        lastRowResult = "제품 중복 검색";
        throw new Error(lastRowResult);
      }

      const rows = await page.$$("tr.tr-product-list");
      const validRows = [];
      var stockQty = 0;

      for (const row of rows) {
        const stockEl = await row.$("td.stock"); // ElementHandle 또는 null
        if (!stockEl) continue;

        // ElementHandle에서 텍스트를 얻을 때는 page.evaluate를 사용
        const stockText = await page.evaluate((el) => el.innerText, stockEl);
        const stock = parseInt(stockText.trim().replace(/,/g, ""), 10) || 0;
        stockQty = stock;
        if (stock > 0) validRows.push(row);
      }

      if (validRows.length === 1) {
        await validRows[0].click();
      } else {
        lastRowResult = "제품 검색 불가";
        throw new Error(lastRowResult);
      }

      await page.type("#product-detail-qty", String(row.order_qty));

      //
      // 2. 재고 체크
      //
      if (row.order_qty > stockQty) {
        lastRowResult = "재고 부족";
        throw new Error(lastRowResult);
      }

      // 주문담기 버튼 클릭
      await page.click("#product-detail-btn-add-product");
      lastRowResult = "장바구니 전송";

      // 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        lastRowResult
      );
    } catch (e) {
      // 에러코드 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        e.message
      );
    }
  }

  await browser.close();

  var ret;

  ret =
    rows.length != 1
      ? {
          error_code: 0,
          error_message: `${constants.messages.SUCCESS_FINISHED}`,
        }
      : {
          error_code: 0,
          error_message: `${lastRowResult}`,
        };

  logger.warn(`Finished HanshinOrder: ${JSON.stringify(ret, null, 2)}`);
  return ret;
};

//브릿지팜
// http://bridgepharm.net
// 아이디 chif2000
// 비번 1234
const runBridgePharmOrder = async (
  systemCode,
  user_id,
  supplier_params,
  rows
) => {
  logger.warn(`Start BridgePharmOrder`);

  if (rows.length === 0) {
    ret = {
      error_code: 0,
      error_message: `${constants.messages.SUCCESS_FINISHED}`,
    };
    return ret;
  }

  const loginUrl = supplier_params.loginUrl;
  const loginId = supplier_params.loginId; // = "chif2000";
  const loginPassword = supplier_params.loginPassword; //= "542500";
  const edgePath = getEdgePath();

  // 브라우저를 보면서 작업내용 확인
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: edgePath, // Edge 경로
    args: [
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-extensions", // ★ 확장 기능 완전 비활성화
      "--disable-popup-blocking",
      "--disable-client-side-phishing-detection", // ★ SafeBrowsing 완전 끄기
      "--disable-features=SafeBrowsing", // ★ 광고/추적 차단 기능 끄기
      "--disable-default-apps",
      "--disable-sync",
      "--disable-web-security",
      "--allow-running-insecure-content",
      "--ignore-certificate-errors",
      "--disable-features=UpgradeHTTPToHTTPS",
    ],
  });
  const page = await browser.newPage();

  page.on("requestfailed", (request) => {
    console.log("❌ FAILED:", request.url(), request.failure());
  });

  var lastRowResult = constants.General.EmptyString;

  // 1️⃣ 로그인
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    // 광고/추적으로 분류되는 요청도 전부 허용
    req.continue();
  });

  await page.evaluateOnNewDocument(() => {
    // alert, confirm, prompt 무력화
    window.alert = () => {};
    window.confirm = () => true;
    window.prompt = () => "";
    // window.open 무력화 (팝업 생성 방지)
    window.open = () => null;
  });
  // 1️⃣ 로그인
  await page.goto(loginUrl, { waitUntil: "domcontentloaded" });

  await page.waitForSelector("#tx_id", { visible: true });

  await page.type("#tx_id", loginId);
  await page.type("#tx_pw", loginPassword);
  await page.evaluate(() => {
    const loginButton = document.querySelector(`a.login`);
    if (loginButton) loginButton.click();
  });

  // 로그인 후 잠시 대기
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const cookies = await page.cookies();
  console.log("쿠키:", cookies);

  if (!cookies || cookies.length <= 0) {
    return {
      error_code: -1,
      error_message: `${constants.messages.FAILED_REQUESTED}`,
    };
  }

  // 2️⃣ 주문/상품조회 페이지 이동
  await page.goto(`${loginUrl}/Service/Order/Order.asp`, {
    waitUntil: "domcontentloaded",
  });

  for (const row of rows) {
    try {
      if (!row.product_code) {
        lastRowResult = "입력 제품 없음";
        throw new Error(lastRowResult); // 입력 제품 없음
      }

      // --- 검색조건 세팅 ---
      await page.select("#so3", "2"); // 조회조건 중 KD코드 선택
      await page.evaluate((kdCode) => {
        document.querySelector("#tx_physic").value = kdCode;
      }, row.product_code);

      // 조회 버튼 클릭
      await page.click("#btn_search2");

      // --- AJAX 로딩 대기: tbody 안에 tr 생길 때까지 ---
      await page.waitForFunction(
        () => document.querySelectorAll(".tbl_list.bdtN tbody tr").length > 0,
        { timeout: 20000 }
      );

      // 렌더링 대기
      await new Promise((resolve) => setTimeout(resolve, 500));

      // --- 조회 결과 파싱 ---
      const searchResultRows = await page.$$eval(
        ".tbl_list.bdtN tbody tr",
        (trs) =>
          trs
            .map((tr) => {
              const kdCode =
                tr.querySelector("td:nth-child(1)")?.innerText.trim() || "";
              const manufacturer =
                tr.querySelector("td:nth-child(2)")?.innerText.trim() || "";
              const productName =
                tr.querySelector("td:nth-child(3)")?.innerText.trim() || "";
              const standard =
                tr.querySelector("td:nth-child(4)")?.innerText.trim() || ""; //규격
              const price =
                tr.querySelector("td:nth-child(6)")?.innerText.trim() || ""; //단가
              const stock =
                tr.querySelector("td:nth-child(7)")?.innerText.trim() || ""; //재고

              return {
                kdCode,
                manufacturer,
                productName,
                standard,
                price,
                stock: tr.querySelector("input[name^='stock_']")?.value || "",
                productId: tr.querySelector("input[name^='pc_']")?.value || "",
                quantityInput:
                  tr.querySelector("input[name^='qty_']")?.id || "",
              };
            })
            .filter((item) => item.stock > 0) // 재고 0 이상만 남김
      );

      console.log(searchResultRows);

      // 조회결과가 1건만 조회되어야 주문 처리 가능 ---
      if (
        searchResultRows.length === 0 ||
        searchResultRows[0].productId === constants.General.EmptyString
      ) {
        lastRowResult = "제품 검색 불가";
        throw new Error(lastRowResult);
      }

      if (searchResultRows.length > 1) {
        lastRowResult = "제품 중복 검색";
        throw new Error(lastRowResult);
      }

      const item = searchResultRows[0];
      const { stock, quantityInput: qtyId } = item;

      const n_stock = Number(item.stock);
      const n_orderQty = Number(row.order_qty);

      if (isNaN(n_stock) || isNaN(n_orderQty)) {
        lastRowResult = "수량 이상";
        throw new Error(lastRowResult);
      }

      if (n_stock <= 0 || n_orderQty > n_stock) {
        lastRowResult = "재고 부족";
        throw new Error(lastRowResult);
      }

      if (qtyId) {
        // 주문수량 입력
        await page.focus(`#${qtyId}`);
        await page.keyboard.type(String(row.order_qty));
      }

      // 장바구니 담기 버튼 클릭
      await page.click("#btn_saveBag");
      await new Promise((resolve) => setTimeout(resolve, 500));

      lastRowResult = "장바구니 전송";
      // 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        lastRowResult
      );
    } catch (e) {
      // 에러코드 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        e.message
      );
    }
  }

  await browser.close();

  var ret;

  ret =
    rows.length != 1
      ? {
          error_code: 0,
          error_message: `${constants.messages.SUCCESS_FINISHED}`,
        }
      : {
          error_code: 0,
          error_message: `${lastRowResult}`,
        };

  logger.warn(`Finished HanshinOrder: ${JSON.stringify(ret, null, 2)}`);
  return ret;
};

function getEdgePath() {
  try {
    const regPath = execSync(
      'powershell -Command "(Get-ItemProperty -Path \\"HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe\\").Path"'
    )
      .toString()
      .trim();

    // exe까지 붙이기
    if (regPath) return path.join(regPath, "msedge.exe");
  } catch (err) {
    console.error("Edge path not found", err);
  }
  return null;
}

export { executeService };
