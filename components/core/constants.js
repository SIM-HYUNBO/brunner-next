`use strict`;

export const SystemCode = {
  Pharmacy: `01`,
  Brunner: `00`,
};

export const UserType = {
  Personal: `Personal`,
  Pharmacy: `Pharmacy`,
  Supplier: `Supplier`,
};

export const modulePrefix = {
  security: `security`,
  dynamicSql: `dynamicSql`,
  postInfo: `postInfo`,
  postCommentInfo: `postCommentInfo`,
  edocComponentTemplate: `edocComponentTemplate`,
  edocDocument: `edocDocument`,
  edocCustom: `edocCustom`,
  workflow: `workflow`,
  pharmacy: `pharmacy`,
};

export const messages = {
  SITE_DESCRIPTION: `Brunner-Next now provides a document management platform that enables you to create and manage electronic documents in real time using an electronic document designer.`,
  EMPTY_STRING: "",
  DATABASE_FAILED: `Database failed.`,
  DELETE_ITEM: `Delete this item?`,
  DELETE_SELECTED_PAGE: `Do you want to delete current selected page?`,
  EMAIL_NOT_VALID: `The [email] is not valid.`,
  FAILED_TO_DELETE_DATA: `Failed to delete data.`,
  FAILED_TO_EXECUTE_WORKFLOW: `Failed to execute workflow.`,
  FAILED_TO_INSERT_DATA: `Failed to insert data.`,
  FAILED_TO_SAVE_DATA: `Failed to save data.`,
  FAILED_TO_SAVE_TXN_HISTORY: `Failed to save transaction history.`,
  FAILED_TO_UPDATE_DATA: `Failed to update data.`,
  FAILED_REQUESTED: `Failed to request service.`,
  INVALID_NUMBER_AMOUNT: `Invalid number or amount.`,
  INVALID_SYSEM_CODE: `Invalid system code.`,
  INVALID_USER_TYPE: `Invalid user type.`,
  LOGIN_REQUIRED: "Login Required.",
  MINIUM_PAGE_COUNT: `Minimum page count is 1.`,
  NO_DATA_FOUND: `No data found.`,
  NO_PERMISSION: `You do not have permission`,
  NOT_SUPPORTED_DB_TYPE: `Not supported Database Type`,
  REQUIRED_FIELD: `The field value is required.`,
  SAVE_DOCUMENT_WITHOUT_TITLE: "Save document without title?",
  SERVER_NOT_CONNECTTED: `cannot connect to server`,
  SERVER_NOT_SUPPORTED_MODULE: `Not supported module`,
  SERVER_NOW_INITIALIZING: `Server is now initializing...`,
  SERVER_NO_COMMAND_NAME: `No commandName provided in request.`,
  SERVER_SQL_NOT_LOADED: `Service SQL not loaded.`,
  SIGNOUT: `Do you want to signout now?`,
  SUCCESS_ADDED: `Successfully added.`,
  SUCCESS_APPLIED: `Successfully applied.`,
  SUCCESS_CHANGED: `Successfully changed.`,
  SUCCESS_CONNECTED: `Successfully connected.`,
  SUCCESS_DELETED: `Successfully deleted.`,
  SUCCESS_FINISHED: `Successfully finished.`,
  SUCCESS_REQUESTED: `Successfully requested.`,
  SUCCESS_SAVED: `Successfully saved.`,
  SUCCESS_SIGNUP: `successfully signed up.`,
  PHONE_NUMBER_NOT_VALID: `The [phoneNumber] is not valid.`,
  PHONE_NUMBER_OR_EMAIL_NOT_VALID: `Invalid user phone number or E-Mail.`,
  UNKNOWN_ERROR: `Unknown error occured.`,
  USER_ID_ALREADY_EXIST: `The [userId] already exist.`,
  USER_ID_NOT_EXIST: `The [userId] does not exist.`,
  USER_ID_LENGTH_CHECK: `The [userId] length should be from 5 to 10.`,
  USER_NAME_LENGTH_CHECK: `The [password] length should be more than 5.`,
  USER_PASSWORD_LENGTH_CHECK: `The [password] length should be more than 5.`,
  WORKFLOW_INVALID_DATA_STRUCTURE: `Invalid data structure.`,
  WORKFLOW_INVALID_SELF_CALL: `Invalid workflow id. self call is not allowed.`,
  WORKFLOW_NODE_NOT_FOUND: `Failed to find Node.`,
  WORKFLOW_NODES_NOT_CONNECTED: `From the Start node, nodes are not connected to the End node. Workflow cannot run.`,
  WORKFLOW_NOT_SUPPORTED_NODE_TYPE: `Not supported node type`,
  WORKFLOW_SAVE_CONFIRM: `There are unsaved changes. Do you want to close?`,
  WORKFLOW_STARTNODE_NOT_FOUND: `Start node not found`,
};

export const commands = {
  DYNAMIC_SEQ_SELECT_ALL: `dynamicSql.selectAll`,
  DYNAMIC_SEQ_UPDATE_ONE: `dynamicSql.updateOne`,
  DYNAMIC_SEQ_DELETE_ONE: `dynamicSql.deleteOne`,

  EDOC_COMPONENT_TEMPLATES_SELECT_ALL: `edocComponentTemplate.selectAll`,
  EDOC_DOCUMENT_UPSERT_ONE: `edocDocument.upsertOne`,
  EDOC_DOCUMENT_SELECT_ONE: `edocDocument.selectOne`,
  EDOC_DOCUMENT_DELETE_ONE: `edocDocument.deleteOne`,
  EDOC_USER_DOCUMENT_SELECT_ALL: `edocDocument.slectUserAll`,
  EDOC_ADMIN_DOCUMENT_SELECT_ALL: `edocDocument.slectAdminAll`,
  EDOC_AI_GET_MODEL_LIST: `edocDocument.getAIModelList`,
  EDOC_AI_GENERATE_DOCUMENT: `edocDocument.generateAIDocument`,

  SECURITY_DELETE_ACCOUNT: `security.deleteAccount`,
  SECURITY_RESET_PASSWORD: `security.resetPassword`,
  SECURITY_SEND_EMAIL_AUTHCODE: `security.sendEMailAuthCode`,
  SECURITY_SIGNOUT: `security.signout`,
  SECURITY_SIGNUP: `security.signup`,
  SECURITY_SIGNIN: `security.signin`,

  POST_INFO_INSERT_ONE: `postInfo.insertOne`,
  POST_INFO_UPDATE_ONE: `postInfo.updateOne`,
  POST_INFO_DELETE_ONE: `postInfo.deleteOne`,
  POST_INFO_SELECT_ALL: `postInfo.selectAll`,

  POST_COMMENT_INFO_INSERT_ONE: `postCommentInfo.insertOne`,
  POST_COMMENT_INFO_UPDATE_ONE: `postCommentInfo.updateOne`,
  POST_COMMENT_INFO_DELETE_ONE: `postCommentInfo.deleteOne`,

  WORKFLOW_SELECT_DB_CONNECTIONS_ALL: `workflow.selectDBConnectionAll`,
  WORKFLOW_INSERT_DB_CONNECTION_ONE: `workflow.insertDBConnectionOne`,
  WORKFLOW_UPDATE_DB_CONNECTION_ONE: `workflow.updateDBConnectionOne`,
  WORKFLOW_DELETE_DB_CONNECTION_ONE: `workflow.deleteDBConnectionOne`,
  WORKFLOW_TEST_DB_CONNECTION: `workflow.testDBConnectionOne`,
  WORKFLOW_EXECUTE_WORKFLOW: "workflow.executeWorkflow",
  WORKFLOW_RESET_WORKFLOW: "workflow.resetWorkflow",
  WORKFLOW_SAVE_WORKFLOW: "workflow.saveflow",
  WORKFLOW_SELECT_WORKFLOW: "workflow.selectWorkflow",
  WORKFLOW_DELETE_WORKFLOW: "workflow.deleteWorkflow",
  WORKFLOW_SELECT_WORKFLOW_LIST: "workflow.selectWorkflowList",

  PHARMACY_USER_SUPPLIER_SELECT_ALL: "pharmacy.userSupplierSelectAll",
  PHARMACY_SUPPLIER_UPSERT_ONE: "pharmacy.upsertSupplierOne",
  PHARMACY_AUTOMATIC_ORDER: "pharmacy.automaticOrder",
  PHARMACY_UPLOAD_DAILY_ORDER: "pharmacy.uploadDailyOrder",
  PHARMACY_VIEW_DAILY_ORDER: "pharmacy.viewDailyOrder",
};

export const edocComponentType = {
  _TEXT: `Text`,
  _TABLE: `Table`,
  _IMAGE: `Image`,
  _INPUT: `Input`,
  _CHECKLIST: `Checklist`,
  _BUTTON: `Button`,
  _VIDEO: `Video`,
  _LINKTEXT: "LinkText",
  _LOTTIE: "Lottie",
};

export const httpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

export const workflowActions = {
  START: "Start",
  END: "End",
  SCRIPT: "Java Script",
  SQL: "SQL",
  BRANCH: "Branch",
  CALL: "Call Workflow",
};

export const workflowRunStatus = {
  idle: "idle",
  running: "running",
};

export const workflowStatus = {
  Started: "Started",
  End: "End",
};

export const transactionMode = {
  Business: "Business",
  System: "System",
};

export const dbType = {
  oracle: "oracle",
  mysql: "mysql",
  postgres: "postgres",
  mssql: "mssql",
};

export const workflowBranchNodeMode = {
  Loop: "Loop",
  Branch: "Branch",
};
