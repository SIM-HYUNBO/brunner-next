`use strict`;

import logger from "@/components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as database from "./../database/database";
import * as dynamicSql from "./../dynamicSql";
import * as mailSender from "@/components/core/server/mailSender";
import puppeteer from "puppeteer";
import bcrypt from "bcryptjs";
import qs from "qs"; // querystring 변환용

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
        break;
    }
  } catch (error) {
    logger.error(`message:${error.message}\n stack:${error.stack}\n`);
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

    const uploadHour =
      new Date().getFullYear().toString() +
      String(new Date().getMonth() + 1).padStart(2, "0") +
      String(new Date().getDate()).padStart(2, "0") +
      String(new Date().getHours()).padStart(2, "0");

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
      jRequest.productName ?? constants.General.EmptyString,
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
      jRequest.productName ?? constants.General.EmptyString,
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
      result.error_message = constants.messages.NO_DATA_FOUND;
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
    }
  } catch (e) {
    ret = { error_code: -1, error_message: e.message };
    logger.warn(`${JSON.stringify(ret, null, 2)}`);
  }
  return ret;
}

async function runHanshinOrder(systemCode, user_id, supplier_params, rows) {
  logger.warn(`Start HanshinOrder`);

  const loginUrl = supplier_params.loginUrl; //"https://www.hanshinpharm.com";
  const loginId = supplier_params.loginId; // = "chif2000";
  const loginPassword = supplier_params.loginPassword; //= "542500";

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
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
      await page.select("#so3", "2"); // KD코드 선택
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
          trs.map((tr) => {
            const tds = tr.querySelectorAll("td");
            return {
              kdCode: tds[0]?.innerText.trim() || constants.General.EmptyString,
              manufacturer:
                tds[1]?.innerText.trim() || constants.General.EmptyString,
              productName:
                tds[2]?.innerText.trim() || constants.General.EmptyString,
              standard:
                tds[3]?.innerText.trim() || constants.General.EmptyString,
              category:
                tds[4]?.innerText.trim() || constants.General.EmptyString,
              price: tds[5]?.innerText.trim() || constants.General.EmptyString,
              stock: tds[6]?.innerText.trim() || constants.General.EmptyString,
              quantityInput:
                tr.querySelector("input[type='text']")?.id ||
                constants.General.EmptyString,
              productId:
                tr.querySelector("input[name^='pc_']")?.value ||
                constants.General.EmptyString,
            };
          })
      );

      console.log(searchResultRows);

      // --- 1건만 주문 처리 ---
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
    } catch (Error) {
      // 에러코드 상태 저장
      const result = await updateOrderStatus(
        systemCode,
        user_id,
        row.upload_hour,
        row.product_code,
        row.supplier_name,
        Error.message
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
}

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

export { executeService };
