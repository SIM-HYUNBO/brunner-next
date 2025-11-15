"use strict";

import logger from "../../../components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as commonFunctions from "@/components/core/commonFunctions";
import { DBConnectionManager } from "./workflow/dbConnectionManager";
import * as workflowEngineServer from "./workflow/workflowEngineServer";
import * as dynamicSql from "./dynamicSql";
import { WorkflowDataModal } from "@/components/workflow/workflowDataModal";

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
          jResponse.message = constants.General.EmptyString;
        } else {
          jResponse.error_code = -1;
          jResponse.error_message = result.error_message;
        }
        break;
      }
      case constants.commands.WORKFLOW_SELECT_WORKFLOW: {
        const result = await workflowEngineServer.getWorkflowByIdOrName(
          jRequest.systemCode,
          jRequest.workflowId
        );

        if (result.error_code === 0) {
          jResponse.error_code = 0;
          jResponse.message = constants.General.EmptyString;
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
          jResponse.error_message = result.error_message;
        } else {
          jResponse.error_code = result.error_code;
          jResponse.error_message = result.error_message;
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

        const { systemCode, workflowIdOrName, transactionMode, inputs } =
          jRequest;

        // workflowId로 DB에서 workflowData 조회
        var result = await workflowEngineServer.getWorkflowByIdOrName(
          systemCode,
          workflowIdOrName
        );
        if (result.error_code != 0) {
          throw new Error(result.error_message);
        }
        const workflowData = result.workflow_data;

        var currentNodeId = workflowData.currentNodeId;

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

          // 트랜잭션 시작
          await txNode.start(workflowData);
          const txInstances = Array.from(txNode.txContexts.values());

          // -----------------------
          // 3️⃣ 실행 분기
          // -----------------------

          if (inputs) workflowData.data.run.inputs = inputs;

          if (transactionMode === constants.transactionMode.Business) {
            // Business 모드: 단일 노드부터 실행
            const node = currentNodeId
              ? workflowData.nodes.find((n) => n.id === currentNodeId)
              : workflowData.nodes.find(
                  (n) => n.data.actionName === constants.workflowActions.START
                );

            if (!node) throw new Error(`Node not found: ${currentNodeId}`);

            const result = await workflowEngineServer.runWorkflowStep(
              systemCode,
              node,
              workflowData,
              txInstances
            );

            // -----------------------
            // 4️⃣ 다음 노드 선택: Branch/Loop selectedPort 기준
            // -----------------------
            const selectedPort = node.data.run.selectedPort; // 'true', 'false', 'loop', 'end' 등
            let nextNodeId = null;

            for (const edge of workflowData.edges || []) {
              if (edge.source === node.id) {
                // edge.sourceHandle 또는 edge.data.port에 selectedPort 매핑
                if (
                  !selectedPort ||
                  edge.sourceHandle === selectedPort ||
                  edge.data?.port === selectedPort
                ) {
                  nextNodeId = edge.target;
                  break; // 하나만 실행
                }
              }
            }

            // 다음 노드가 없으면 START 노드로 초기화
            if (nextNodeId) workflowData.currentNodeId = nextNodeId;
            else
              workflowData.currentNodeId = workflowData.nodes.find(
                (n) => n.data.actionName === constants.workflowActions.START
              ).id;

            // -----------------------
            // 5️⃣ 워크플로우 저장
            // -----------------------
            const saveResult = await workflowEngineServer.saveWorkflow(
              systemCode,
              jRequest.userId,
              workflowIdOrName,
              workflowData
            );

            if (result.error_code != 0) {
              throw new Error(result.error_message);
            }

            // -----------------------
            // 6️⃣ 트랜잭션 커밋
            // -----------------------
            await txNode.commit();

            jResponse.error_code = result.error_code;
            jResponse.jWorkflow = workflowData;
            jResponse.message = result.error_message;
          } else {
            // System 모드: 전체 워크플로우 실행
            result = await workflowEngineServer.executeWorkflow(
              systemCode,
              workflowData,
              txInstances,
              false
            );

            if (result.error_code != 0) {
              throw new Error(result.error_message);
            }

            // -----------------------
            // 트랜잭션 커밋
            // -----------------------
            await txNode.commit();

            jResponse.error_code = result.error_code;
            jResponse.jWorkflow = workflowData;
            jResponse.message = result.error_message;
          }
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
      case constants.commands.WORKFLOW_RESET_WORKFLOW: {
        jResponse = { error_code: -1 };

        const { systemCode, workflowId, userId } = jRequest;

        try {
          // 1️⃣ workflowId로 DB에서 workflowData 조회
          const result = await workflowEngineServer.getWorkflowByIdOrName(
            systemCode,
            workflowId
          );

          if (result.error_code !== 0) {
            throw new Error(result.error_message);
          }

          // Reset
          const saveResult = await workflowEngineServer.resetWorkflow(
            result.workflow_data,
            systemCode,
            userId
          );

          if (saveResult.error_code !== 0) {
            throw new Error(saveResult.error_message);
          }

          jResponse.error_code = saveResult.error_code;
          jResponse.error_message = constants.messages.SUCCESS_FINISHED;
          jResponse.workflow_data = saveResult.workflow_data;
        } catch (err) {
          jResponse.error_code = -1;
          jResponse.error_message = String(err.message || err);
        }

        break;
      }
      // ❌ 정의되지 않은 commandName
      default: {
        throw new Error(constants.messages.SERVER_NOT_SUPPORTED_METHOD);
      }
    }
  } catch (error) {
    jResponse.error_code = -1;
    jResponse.error_message = error.message;
    logger.error(`message:${error.message}\n stack:${error.stack}\n`);
  } finally {
    return jResponse;
  }
};

export { executeService };
