`use strict`;

import logger from "@/components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as commonFunctions from "@/components/core/commonFunctions";
import * as database from "@/pages/api/biz/database/database";
import * as dynamicSql from "@/pages/api/biz/dynamicSql";

// 사용자가 eDocDesigner로 만든 화면에서 백엔드를 호출한 경우 처리한다.
// 커스텀 서비스 처리 로직의 일반화가 중요하다.

const executeService = async (txnId, jRequest) => {
  var jResponse = {};
  let cmd = jRequest.commandName;

  // 커스텀 서비스의 경우, 내부용 모듈 접두사 (eDocCustom.)를 제거한다.
  if (cmd.startsWith(`${constants.modulePrefix.edocCustom}.`)) {
    cmd = cmd.slice(constants.modulePrefix.edocCustom.length + 1);
  }

  try {
    switch (cmd) {
      default:
        break;
    }

    jResponse = {
      error_code: 0,
      error_message: `The custom service [${cmd}] executed.`,
    };
  } catch (e) {
    logger.error(`message:${e.message}\n stack:${e.stack}\n`);
  } finally {
    return jResponse;
  }
};

export { executeService };
