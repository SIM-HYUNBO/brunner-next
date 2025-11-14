"use strict";
import * as constants from "@/components/core/constants";

export async function RequestServer(
  jRequest,
  method = constants.httpMethod.POST,
  serverUrl = `/api/backendServer/`,
  ContentType = `application/json`
) {
  let res = null;
  let jResponse = null;
  let params =
    ContentType == constants.General.EmptyString
      ? {
          method: method,
          body: JSON.stringify(jRequest),
        }
      : {
          method: method,
          headers: {
            "Content-Type": ContentType,
          },
          body: JSON.stringify(jRequest),
        };

  try {
    res = await fetch(serverUrl, params);

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
  workflowIdOrName,
  transactionMode,
  inputData
) {
  try {
    var jRequest = {
      commandName: constants.commands.WORKFLOW_EXECUTE_WORKFLOW,
      systemCode: systemCode,
      userId: userId,
      workflowIdOrName,
      transactionMode: transactionMode,
      inputs: inputData,
    };
    const jResponse = await RequestServer(jRequest);
    return jResponse;
  } catch (err) {
    throw err;
  }
}
