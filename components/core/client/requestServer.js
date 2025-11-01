"use strict";
import * as constants from "@/components/core/constants";

export async function RequestServer(
  jRequest,
  method = constants.httpMethod.POST,
  serverUrl = `/api/backendServer/`
) {
  let res = null;
  let jResponse = null;

  try {
    res = await fetch(serverUrl, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jRequest),
    });

    jResponse = res.json();
    return jResponse;
  } catch (e) {
    jResponse = {};
    jResponse.error_code = -1;
    jResponse.error_message = `${constants.messages.SERVER_NOT_CONNECTTED} ${e}`;
    return jResponse;
  }
}

export async function RequestExecuteWorkflow(
  systemCode,
  userId,
  workflowId,
  transactionMode,
  inputData
) {
  try {
    var jRequest = {
      commandName: constants.commands.WORKFLOW_EXECUTE_WORKFLOW,
      systemCode: systemCode,
      userId: userId,
      workflowId: workflowId,
      transactionMode: transactionMode,
      inputs: inputData,
    };
    const jResponse = await RequestServer(jRequest);
    return jResponse;
  } catch (err) {
    throw err;
  }
}
