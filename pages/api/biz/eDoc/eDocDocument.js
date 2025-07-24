`use strict`

import logger from "../../winston/logger"
import * as constants from '@/components/constants'
import * as database from "../database/database"
import * as dynamicSql from '../dynamicSql'
import * as commonFunctions from '@/components/commonFunctions'

const executeService = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case constants.commands.EDOC_DOCUMENT_UPSERT_ONE:
                jResponse = await upsertOne(txnId, jRequest);
                break;
            case constants.commands.EDOC_DOCUMENT_SELECT_ONE:
                jResponse = await selectOne(txnId, jRequest);
                break;
            case constants.commands.EDOC_DOCUMENT_DELETE_ONE:
                jResponse = await deleteOne(txnId, jRequest);
                break;
            case constants.commands.EDOC_USER_DOCUMENT_SELECT_ALL: // user all documents
                jResponse = await selectUserAll(txnId, jRequest);
                break;
            case constants.commands.EDOC_ADMIN_DOCUMENT_SELECT_ALL: // admin & public documents
                jResponse = await selectAdminAll(txnId, jRequest);
                break;
            default:
                break;
        }
    } catch (error) {
        logger.error(`message:${error.message}\n stack:${error.stack}\n`);
    } finally {
        return jResponse;
    }
}


const upsertOne = async (txnId, jRequest) => {
  const jResponse = {};
  let isInsert = null;

  try {
    jResponse.commandName = jRequest.commandName;

    if (!jRequest.documentData) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [documentData]`;
      return jResponse;
    }

    if (!jRequest.documentData.id) {
      jRequest.documentData.id = commonFunctions.generateUUID();

      if (!jRequest.documentData.title) {
        jRequest.documentData.title = "New document";
      }

      if (!jRequest.documentData.description) {
        jRequest.documentData.description = "New document";
      }

      isInsert = true; // insert
    } else {
      isInsert = false; // update
    }

    if (!jRequest.documentData.title) {
      jRequest.documentData.title = constants.messages.EMPTY_STRING;
    }

    // ✅ pages는 필수 JSON
    if (!jRequest.documentData.pages) {
      jRequest.documentData.pages = [];
    }

    if (isInsert) {
      // INSERT
      const sql = await dynamicSql.getSQL00('insert_TB_DOC_DOCUMENT', 1);
      const insertResult = await database.executeSQL(sql, [
        jRequest.systemCode,
        jRequest.documentData.id,
        jRequest.documentData.title,
        jRequest.documentData.description,
        1, // version
        jRequest.userId,
        JSON.stringify(jRequest.documentData.runtime_data || {}),
        JSON.stringify(jRequest.documentData.pages || []),
        '/mainPages/edocument?documentId=' +  jRequest.documentData.id, // menu_path는 항상 고정
      ]);

      if (insertResult.rowCount !== 1) {
        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.FAILED_TO_SAVE;
        return jResponse;
      }
    } else {
      // UPDATE
      const sql = await dynamicSql.getSQL00('update_TB_DOC_DOCUMENT', 1);
      const updateResult = await database.executeSQL(sql, [
        jRequest.systemCode,
        jRequest.documentData.id,
        jRequest.documentData.title,
        jRequest.documentData.description,
        jRequest.userId,
        JSON.stringify(jRequest.documentData.runtime_data || {}),
        JSON.stringify(jRequest.documentData.pages || []),
        '/mainPages/edocument?documentId=' +  jRequest.documentData.id, // menu_path는 항상 고정
      ]);

      if (updateResult.rowCount !== 1) {
        jResponse.error_code = -1;
        jResponse.error_message = constants.messages.FAILED_TO_SAVE;
        return jResponse;
      }
    }

    jResponse.error_code = 0;
    jResponse.error_message = constants.messages.SUCCESS_SAVED;
    jResponse.documentData = jRequest.documentData;
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1;
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};


const selectOne = async (txnId, jRequest) => {
  const jResponse = {};

  try {
    jResponse.commandName = jRequest.commandName;

    if (!jRequest.documentId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [documentData.id]`;
      return jResponse;
    }

    // ✅ TB_DOC_DOCUMENT에서 pages 포함 가져오기
    const sql = await dynamicSql.getSQL00('select_TB_DOC_DOCUMENT', 1);
    const select_TB_DOC_DOCUMENT = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.documentId
    ]);

    if (select_TB_DOC_DOCUMENT.rowCount < 1) {
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.NO_DATA_FOUND;
      return jResponse;
    }

    const row = select_TB_DOC_DOCUMENT.rows[0];

    const documentData = {
      id: row.id,
      title: row.title,
      description: row.description,
      runtime_data: row.runtime_data,
      pages: row.pages || [],
      menu_path: row.menu_path, // 메뉴 경로
      // ✅ components는 pages에 이미 포함되므로 제거!
    };

    jResponse.documentData = documentData;
    jResponse.error_code = 0;
    jResponse.error_message = constants.messages.EMPTY_STRING;
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1;
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const deleteOne = async (txnId, jRequest) => {
  const jResponse = {};

  try {
    jResponse.commandName = jRequest.commandName;

    if (!jRequest.documentId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [documentId]`;
      return jResponse;
    }

    // TB_DOC_DOCUMENT 삭제만 수행
    const sql = await dynamicSql.getSQL00('delete_TB_DOC_DOCUMENT', 1);
    const delete_TB_DOC_DOCUMENT = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.documentId
    ]);

    jResponse.error_code = 0;
    jResponse.error_message = constants.messages.SUCCESS_DELETED;
    jResponse.documentData = jRequest.documentData; // optional
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1;
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const selectUserAll = async (txnId, jRequest) => {
    var jResponse = {};
    
    try {
        jResponse.commanaName = jRequest.commandName;
        
        // select TB_DOC_DOCUMENT
        var sql = null
        sql = await dynamicSql.getSQL00('select_TB_DOC_DOCUMENT', 2);
        var select_TB_DOC_DOCUMENT = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId   
            ]);

        jResponse.documentList = select_TB_DOC_DOCUMENT.rows;

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

// 관리자가 작성한 공용문서 전체 목록 조회
const selectAdminAll = async (txnId, jRequest) => {
    var jResponse = {};
    
    try {
        jResponse.commanaName = jRequest.commandName;
        
        // select TB_DOC_DOCUMENT
        var sql = null
        sql = await dynamicSql.getSQL00('select_TB_DOC_DOCUMENT', 3);
        var select_TB_DOC_DOCUMENT = await database.executeSQL(sql,
            [
                jRequest.systemCode,
            ]);

        jResponse.documentList = select_TB_DOC_DOCUMENT.rows;

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

export { executeService };