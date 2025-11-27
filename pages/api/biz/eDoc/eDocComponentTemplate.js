`use strict`;

import logger from "@/components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as database from "@/pages/api/biz/database/database";
import * as dynamicSql from "@/pages/api/biz/dynamicSql";

const executeService = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    switch (jRequest.commandName) {
      case constants.commands.EDOC_COMPONENT_TEMPLATES_SELECT_ALL:
        jResponse = await selectAll(txnId, jRequest);
        break;
      default:
        break;
    }
  } catch (e) {
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

    var sql = null;
    sql = await dynamicSql.getSQL(
      jRequest.systemCode,
      "select_BRUNNER.TB_DOC_COMPONENT_TEMPLATE",
      1
    );
    var select_TB_DOC_COMPONENT_TEMPLATE = await database.executeSQL(sql, [
      jRequest.systemCode,
    ]);

    jResponse.templateList = select_TB_DOC_COMPONENT_TEMPLATE.rows;

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

export { executeService };
