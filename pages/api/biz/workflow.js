"use strict";

import logger from "../../../components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as commonFunctions from "@/components/core/commonFunctions";
import { dbConnectionManager } from "@/components/workflow/dbConnectionManager";

/**
 * Workflow 모듈의 서비스 실행 함수
 */
const executeService = async (txnId, jRequest) => {
  let jResponse = { error_code: 0 };

  try {
    switch (jRequest.commandName) {
      // ✅ 1. DB 연결정보 전체 조회
      case constants.commands.WORKFLOW_SELECT_DB_CONNECTIONS_ALL: {
        const connections = await dbConnectionManager.list();
        jResponse.connections = connections;
        break;
      }

      // ✅ 2. 연결정보 추가
      case constants.commands.WORKFLOW_INSERT_DB_CONNECTION_ONE: {
        await dbConnectionManager.register(jRequest.connection);
        jResponse.message = "DB 연결정보가 추가되었습니다.";
        break;
      }

      // ✅ 3. 연결정보 수정
      case constants.commands.WORKFLOW_UPDATE_DB_CONNECTION_ONE: {
        await dbConnectionManager.update(jRequest.connection);
        jResponse.message = "DB 연결정보가 수정되었습니다.";
        break;
      }

      // ✅ 4. 연결정보 삭제
      case constants.commands.WORKFLOW_DELETE_DB_CONNECTION_ONE: {
        await dbConnectionManager.remove(jRequest.id);
        jResponse.message = "DB 연결정보가 삭제되었습니다.";
        break;
      }

      // ✅ 5. 연결 테스트
      case constants.commands.WORKFLOW_TEST_DB_CONNECTION: {
        const result = await dbConnectionManager.testConnection(
          jRequest.connection
        );

        if (result) {
          jResponse.message = "DB 연결 테스트 성공";
        } else {
          jResponse.error_code = -1;
          jResponse.error_message = result.message || "DB 연결 테스트 실패";
        }
        break;
      }

      // ❌ 정의되지 않은 commandName
      default: {
        jResponse = {
          error_code: -1,
          error_message: `지원되지 않는 commandName입니다: ${jRequest.commandName}`,
        };
        break;
      }
    }
  } catch (error) {
    logger.error(`message:${error.message}\n stack:${error.stack}\n`);
    jResponse = {
      error_code: -1,
      error_message: error.message || "워크플로우 서비스 처리 중 오류 발생",
    };
  } finally {
    return jResponse;
  }
};

export { executeService };
