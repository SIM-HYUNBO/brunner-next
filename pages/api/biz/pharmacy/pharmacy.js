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
        jResponse = await userSupplierSelectAll(txnId, jRequest);
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
        jRequest.userId,
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
      jResponse.error_message = constants.messages.EMPTY_STRING;
    } else {
      jResponse.error_code = -3;
      jResponse.error_message = `Failed to create serviceSQL.\n`;
    }
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const userSupplierSelectAll = async (txnId, jRequest) => {
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
      const insert_TB_PHM_DAILY_ORDER = await database.executeSQL(sql, [
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
      jRequest.supplierName ?? "",
      jRequest.productName ?? "",
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
      jRequest.supplierName ?? "",
      jRequest.productName ?? "",
    ]);

    if (select_TB_PHM_DAILY_ORDER_01.level == "error") {
      jResponse.error_code = -1;
      jResponse.error_message = select_TB_PHM_DAILY_ORDER_01.message;
      return jResponse;
    }

    const supplierName = "한신약품";

    const filteredRows = select_TB_PHM_DAILY_ORDER_01.rows.filter(
      (row) => row.supplier_name === supplierName
    );

    result = await runOrderBySupplier(supplierName, filteredRows);

    jResponse.error_code = 0;
    jResponse.data = result;
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1; // exception
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

export async function runOrderBySupplier(supplierName, rows) {
  var ret = { error_code: -1, error_message: `` };
  try {
    switch (supplierName) {
      case `한신약품`:
        ret = await runHanshinOrder(rows);
        break;
    }
  } catch (e) {
    const ret = { error_code: -1, error_message: e.message };
    logger.warn(`${JSON.stringify(ret, null, 2)}`);
    return ret;
  }
}

async function runHanshinOrder(rows) {
  logger.warn(`Start HanshinOrder`);

  const url = "https://www.hanshinpharm.com";
  const loginId = "chif2000";
  const loginPw = "542500";

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // 1️⃣ 로그인
  await page.goto(url, { waitUntil: "domcontentloaded" });

  await page.type("#tx_id", loginId);
  await page.type("#tx_pw", loginPw);

  await page.evaluate(() => {
    const loginButton = document.querySelector(`a.login`);
    if (loginButton) loginButton.click();
  });

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

  // 2️⃣ 주문/상품조회 페이지 이동
  await page.goto(`${url}/Service/Order/Order.asp`, {
    waitUntil: "domcontentloaded",
  });

  for (const row of rows) {
    if (!row.product_code) continue;

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

    // 렌더링 여유
    await new Promise((resolve) => setTimeout(resolve, 500));

    // --- 조회 결과 파싱 ---
    const searchResultRows = await page.$$eval(
      ".tbl_list.bdtN tbody tr",
      (trs) =>
        trs.map((tr) => {
          const tds = tr.querySelectorAll("td");
          return {
            kdCode: tds[0]?.innerText.trim() || "",
            manufacturer: tds[1]?.innerText.trim() || "",
            productName: tds[2]?.innerText.trim() || "",
            standard: tds[3]?.innerText.trim() || "",
            category: tds[4]?.innerText.trim() || "",
            price: tds[5]?.innerText.trim() || "",
            stock: tds[6]?.innerText.trim() || "",
            quantityInput: tr.querySelector("input[type='text']")?.id || "",
            productId: tr.querySelector("input[name^='pc_']")?.value || "",
          };
        })
    );

    console.log(searchResultRows);

    // --- 1건만 주문 처리 ---
    if (searchResultRows.length > 0) {
      const qtyId = searchResultRows[0].quantityInput;
      if (qtyId) {
        await page.focus(`#${qtyId}`);
        await page.keyboard.type(String(row.order_qty));
        console.log(`✅ 주문 수량(${row.order_qty}) 입력 완료`);
      }

      // 장바구니 담기 버튼 클릭
      await page.click("#btn_saveBag");
      console.log("✅ 장바구니 담기 완료");
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  await browser.close();

  const ret = {
    error_code: 0,
    error_message: `${constants.messages.SUCCESS_FINISHED}`,
  };
  logger.warn(`Finished HanshinOrder: ${JSON.stringify(ret, null, 2)}`);
  return ret;
}

export { executeService };
