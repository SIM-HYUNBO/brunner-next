"use strict";

import logger from "../../../components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as commonFunctions from "@/components/core/commonFunctions";
import { DBConnectionManager } from "./workflow/dbConnectionManager";
import * as workflowEngineServer from "./workflow/workflowEngineServer";
import * as dynamicSql from "./dynamicSql";
import next from "next";

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
      case constants.commands.WORKFLOW_SELECT_WORKFLOW: {
        const result = await workflowEngineServer.getWorkflowById(
          jRequest.systemCode,
          jRequest.workflowId
        );

        if (result.error_code === 0) {
          jResponse.error_code = 0;
          jResponse.message = "";
          jResponse.workflow_data = result.workflow_data;
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
        jResponse = { error_code: -1 };

        const { systemCode, workflowId, transactionMode } = jRequest;

        // workflowId로 DB에서 workflowData 조회
        var result = await workflowEngineServer.getWorkflowById(
          systemCode,
          workflowId
        );
        if (result.error_code != 0) {
          throw new Error(result.error_message);
        }
        const workflowData = result.workflow_data;

        var currentNodeId =
          workflowData.currentNodeId ?? constants.workflowActions.START;

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

            const node = currentNodeId
              ? workflowData.nodes.find((n) => n.id === currentNodeId)
              : workflowData.nodes.find(
                  (n) => n.data.actionName === constants.workflowActions.START
                );

            if (!node) throw new Error(`Node not found: ${currentNodeId}`);

            const txInstances = Array.from(txNode.txContexts.values());

            const result = await workflowEngineServer.runWorkflowStep(
              node,
              workflowData,
              txInstances
            );

            var nextNodeId = null;
            for (const edge of workflowData.edges || []) {
              // 현재 노드에서 나가는 엣지만 검사
              if (edge.source === node.id) {
                if (!edge.data?.condition || Boolean(edge.data.condition)) {
                  nextNodeId = edge.target;
                  break; // 보통 하나만 실행하므로 탈출 (여러 조건 분기면 빼도 됨)
                }
              }
            }
            workflowData.currentNodeId =
              nextNodeId ?? constants.workflowActions.START;

            // Business 트랜잭션의 단위 노드 실행결과는 DB 저장함
            const saveResult = await workflowEngineServer.saveWorkflow(
              systemCode,
              jRequest.userId,
              workflowId,
              workflowData
            );
          } else {
            const txInstances = Array.from(txNode.connections.values());
            // System 모드: 전체 워크플로우 실행
            await workflowEngineServer.executeWorkflow(
              workflowData,
              txInstances
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
            console.error(
              `${constants.messages.DATABASE_FAILED}: ${rollbackErr}`
            );
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
      error_message: `${constants.messages.FAILED_TO_EXECUTE_WORKFLOW} ${error.message}`,
    };
  } finally {
    return jResponse;
  }
};

export { executeService };
