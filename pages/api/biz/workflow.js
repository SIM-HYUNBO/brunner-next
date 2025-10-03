"use strict";

import logger from "../../../components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as commonFunctions from "@/components/core/commonFunctions";
import { DBConnectionManager } from "./workflow/dbConnectionManager";
import * as workflowEngineServer from "./workflow/workflowEngineServer";
import * as dynamicSql from "./dynamicSql";

/**
 * Workflow 모듈의 서비스 실행 함수
 */
const executeService = async (txnId, jRequest) => {
  let jResponse = { error_code: 0 };

  try {
    switch (jRequest.commandName) {
      // ✅ 워크플로우 목록 조회
      case constants.commands.WORKFLOW_SELECT_WORKFLOW_LIST: {
        const result = await workflowEngineServer.getWorkflowList(
          jRequest.systemCode,
          jRequest.userId
        );

        if (result.error_code === 0) {
          jResponse.error_code = 0;
          jResponse.list = result.list; // [{ id, name, description }]
          jResponse.message = "";
        } else {
          jResponse.error_code = -1;
          jResponse.error_message = result.error_message;
        }
        break;
      }
      case constants.commands.WORKFLOW_SAVE_WORKFLOW: {
        const result = await workflowEngineServer.saveWorkflow(
          jRequest.systemCode,
          jRequest.userId,
          jRequest.workflowId,
          jRequest.workflowData
        );

        if (result.error_code == 0) {
          jResponse.error_code = result.error_code;
          jResponse.message = "워크플로우 저장 성공";
        } else {
          jResponse.error_code = -1;
          jResponse.error_message =
            result.error_message || " 워크플로우 저장 실패";
        }
        break;
      }
      case constants.commands.WORKFLOW_DELETE_WORKFLOW: {
        const result = await workflowEngineServer.deleteWorkflow(
          jRequest.systemCode,
          jRequest.userId,
          jRequest.workflowId
        );

        if (result.error_code == 0) {
          jResponse.error_code = result.error_code;
          jResponse.message = "워크플로우 삭제 성공";
        } else {
          jResponse.error_code = -1;
          jResponse.error_message =
            result.error_message || " 워크플로우 삭제 실패";
        }
        break;
      }
      // ✅ 1. DB 연결정보 전체 조회
      case constants.commands.WORKFLOW_SELECT_DB_CONNECTIONS_ALL: {
        const result = await DBConnectionManager.getInstance().list();
        jResponse.connections = result;
        break;
      }
      // ✅ 2. 연결정보 추가
      case constants.commands.WORKFLOW_INSERT_DB_CONNECTION_ONE: {
        const result = await DBConnectionManager.getInstance().register(
          jRequest.connection
        );
        if (result.error_code == 0)
          jResponse.message = "DB 연결정보가 추가(저장)되었습니다.";
        else jResponse.message = result.error_message;

        jResponse.id = result.insertedId;
        break;
      }
      // ✅ 3. 연결정보 수정
      case constants.commands.WORKFLOW_UPDATE_DB_CONNECTION_ONE: {
        const result = await DBConnectionManager.getInstance().update(
          jRequest.connection
        );
        if (result.error_code === 0)
          jResponse.message = "DB 연결정보가 수정되었습니다.";
        else jResponse.message = result.error_message;

        break;
      }
      // ✅ 4. 연결정보 삭제
      case constants.commands.WORKFLOW_DELETE_DB_CONNECTION_ONE: {
        const result = await DBConnectionManager.getInstance().remove(
          jRequest.id
        );

        if (result.error_code === 0)
          jResponse.message = "DB 연결정보가 삭제되었습니다.";
        else jResponse.message = result.error_message;

        break;
      }
      // ✅ 5. 연결 테스트
      case constants.commands.WORKFLOW_TEST_DB_CONNECTION: {
        const result = await DBConnectionManager.getInstance().testConnection(
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

      case constants.commands.WORKFLOW_EXECUTE_WORKFLOW: {
        jResponse = { error_code: -1 }; // 초기값

        const { systemCode, workflowId, transactionMode, currentNodeId } =
          jRequest;

        // workflowId로 DB에서 workflowData 조회
        const workflowData = await workflowEngineServer.getWorkflowById(
          systemCode,
          workflowId
        );

        var txNode = null;
        try {
          // -----------------------
          // 1️⃣ 요청 검증
          // -----------------------
          if (!workflowData) throw new Error("workflowData is required");

          if (
            ![
              constants.transactionMode.System,
              constants.transactionMode.Business,
            ].includes(transactionMode)
          ) {
            throw new Error(`Invalid transactionMode: ${transactionMode}`);
          }

          if (
            transactionMode === constants.transactionMode.Business &&
            !currentNodeId
          ) {
            throw new Error("currentNodeId is required in Business mode");
          }

          if (!workflowData.nodes || !workflowData.nodes.length) {
            throw new Error("workflowData.nodes is empty");
          }

          // -----------------------
          // 2️⃣ 트랜잭션 노드 생성
          // -----------------------
          txNode = new workflowEngineServer.TransactionNode();

          // 트랜잭션 시작: workflowData에 연결정보 포함되어 있어야 함
          await txNode.start(workflowData);

          // -----------------------
          // 3️⃣ 실행 분기
          // -----------------------
          if (transactionMode === constants.transactionMode.Business) {
            // Business 모드: 단일 노드부터 실행
            const node = workflowData.nodes.find((n) => n.id === currentNodeId);
            if (!node) throw new Error(`Node not found: ${currentNodeId}`);

            const txInstance = node.data?.connectionId
              ? txNode.get(node.data.connectionId)
              : undefined;

            await workflowEngineServer.runWorkflowStep(
              node,
              workflowData,
              txInstance
            );
          } else {
            // System 모드: 전체 워크플로우 실행
            await workflowEngineServer.executeWorkflow(
              workflowData,
              txNode.txContexts
            );
          }

          // -----------------------
          // 4️⃣ 트랜잭션 커밋
          // -----------------------
          await txNode.commit();

          jResponse.error_code = 0;
          jResponse.jWorkflow = workflowData;
          jResponse.message = "Workflow executed successfully";
        } catch (err) {
          // -----------------------
          // 5️⃣ 에러 발생 시 롤백
          // -----------------------
          try {
            if (txNode) await txNode?.rollback();
          } catch (rollbackErr) {
            console.error("Rollback failed:", rollbackErr);
          }

          jResponse.error_code = -1;
          jResponse.error_message = String(err.message || err);
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
