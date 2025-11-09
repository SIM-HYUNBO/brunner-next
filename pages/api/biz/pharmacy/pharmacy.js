`use strict`;

import logger from "@/components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as database from "./../database/database";
import * as dynamicSql from "./../dynamicSql";
import * as mailSender from "@/components/core/server/mailSender";
import puppeteer from "puppeteer";
import bcrypt from "bcryptjs";

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
      default:
        break;
    }
  } catch (error) {
    logger.error(`message:${error.message}\n stack:${error.stack}\n`);
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
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId`;
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
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId`;
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

    for (const row of select_TB_PHM_DAILY_ORDER_01.rows) {
      // 공급업체별 자동주문 실행
      let result;
      switch (row.supplier_name) {
        case "한신약품":
          result = await runHanshinOrder(row);
          break;
        default:
          break;
      }
    }

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

export async function runHanshinOrder(row) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--ignore-certificate-errors", // ✅ 인증서 오류 무시
      "--ignore-certificate-errors-spki-list",
    ],
  });
  const page = await browser.newPage();

  const url = "https://www.hanshinpharm.com/";
  const loginId = "chif2000";
  const loginPw = "542500";

  try {
    // 1️⃣ 로그인
    await page.goto(url, { waitUntil: "networkidle0" });

    // 1️⃣ 아이디/비밀번호 입력
    await page.waitForSelector("#tx_id");
    await page.type("#tx_id", loginId);

    await page.waitForSelector("#tx_pw");
    await page.type("#tx_pw", loginPw);

    // 2️⃣ 로그인 버튼 클릭 (a.login)
    await page.waitForSelector("a.login");
    await Promise.all([
      page.click("a.login"),
      page.waitForNavigation({ waitUntil: "networkidle0" }), // 로그인 후 페이지 로딩 대기
    ]);

    // 2️⃣ 상세페이지로 이동
    const detailUrl = `https://www.hanshinpharm.com/Service/Order/PhysicInfo.asp?pc=${row.product_code}&ln=0&currVenCd=5046E&currMkind=&cookPView=&wPhyCd=&currLoc='00001'`;
    await page.goto(detailUrl, { waitUntil: "networkidle2" });

    // 3️⃣ 페이지 안정화 대기
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 4️⃣ 수량 입력 (row.orderQty 만큼)
    await page.evaluate((orderQty) => {
      const qtyInput = document.querySelector("input.setInput_h18_qty");
      if (!qtyInput) throw new Error("수량 입력 필드 없음");
      qtyInput.value = orderQty;
      qtyInput.dispatchEvent(new Event("input", { bubbles: true }));
    }, row.orderQty);

    await new Promise((resolve) => setTimeout(resolve, 500));

    // 5️⃣ 장바구니 버튼 클릭
    await page.evaluate(() => {
      const cartBtn = document.querySelector("#btn_saveBag");
      if (!cartBtn) throw new Error("장바구니 버튼 없음");
      cartBtn.click();
    });

    // 6️⃣ 처리 완료 후 안정화 딜레이
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { error_code: 0, error_message: "장바구니 담기 완료" };

    // 3️⃣ 주문 제출 (주석 해제하면 자동 주문 가능)
    // await page.goto("https://mall.hanshinpharm.co.kr/cart");
    // await page.click("#orderAllButton");
    // await page.waitForNavigation();

    return { error_code: 0, error_message: "주문이 완료되었습니다." };
  } catch (e) {
    return { error_code: -1, error_message: e.message };
  } finally {
    await browser.close();
  }
}

export { executeService };
