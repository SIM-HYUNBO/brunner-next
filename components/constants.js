`use strict`

export function isJsonObject(obj) {
    return obj && typeof obj === 'object' && !Array.isArray(obj);
}

export const messages = {    
    EMPTY_STRING : '',
    MESSAGE_DATABASE_FAILED : `Database failed.`,
    MESSAGE_DELETE_ITEM : `Delete this item?`,
    MESSAGE_FAILE_TO_SAVE : `Failed to save.`,
    MESSAGE_INPUT_STOCK_SYMBOL : `Select or Input a stock symbol.`,
    MESSAGE_INVALIED_NUMBER_AMOUNT : `Invalid number or amount.`,
    MESSAGE_NO_DATA_FOUND : `No data found.`,
    MESSAGE_NO_PERMISSION : `You do not have permission`,
    MESSAGE_REQUIRED_FIELD : `The field value is required.`,
    MESSAGE_SERVER_NOT_CONNECTTED : `cannot connect to seerver`,
    MESSAGE_SERVER_NOT_SUPPORTED_MODULE : `not supported module`,
    MESSAGE_SERVER_NOW_INITIALIZING : "Server is now initializing...",
    MESSAGE_SERVER_SQL_NOT_LOADED : `Service SQL not loaded.`,
    MESSAGE_SIGNOUT : `Do you want to signout now?`,
    MESSAGE_SUCCESS_ADDED : `Successfully added.`,
    MESSAGE_SUCCESS_DELETED : `Successfully deleted.`,
    MESSAGE_SUCCESS_SAVED : `Successfully saved.`,
    MESSAGE_SUCCESS_SIGNUP : `successfully signed up.`,
    MESSAGE_UNKNOWN_ERROR : `Unknown error occured.`,
}

export const commands = {
    COMMAND_DYNAMIC_SEQ_SELECT_ALL : `dynamicSql.selectAll`,
    COMMAND_DYNAMIC_SEQ_UPDATE_ONE : `dynamicSql.updateOne`,
    COMMAND_DYNAMIC_SEQ_DELETE_ONE : `dynamicSql.deleteOne`,
    COMMAND_DYNAMIC_SEQ_LOAD_ALL : `dynamicSql.loadAll`, 

    COMMAND_SECURITY_DELETE_ACCOUNT : `security.deleteAccount`,
    COMMAND_SECURITY_RESET_PASSWORD : `security.resetPassword`,
    COMMAND_SECURITY_SEND_EMAIL_AUTHCODE : `security.sendEMailAuthCode`,
    COMMAND_SECURITY_SIGNOUT : `security.signout`,
    COMMAND_SECURITY_SIGNUP : `security.signup`,
    COMMAND_SECURITY_SIGNIN : `security.signin`,

    COMMAND_INCOME_HISTORY_INSERT_ONE : `incomeHistory.insertOne`,
    COMMAND_INCOME_HISTORY_DELETE_ONE : `incomeHistory.deleteOne`,
    COMMAND_INCOME_HISTORY_SELECT_BY_USERID : `incomeHistory.selectByUserId`,
    COMMAND_INCOME_HISTORY_UPDATE_ONE : `incomeHistory.updateOne`,

    COMMAND_POST_INFO_INSERT_ONE : `postInfo.insertOne`,
    COMMAND_POST_INFO_UPDATE_ONE : `postInfo.updateOne`,
    COMMAND_POST_INFO_DELETE_ONE : `postInfo.deleteOne`,
    COMMAND_POST_INFO_SELECT_ALL : `postInfo.selectAll`,

    COMMAND_POST_COMMENT_INFO_INSERT_ONE : `postCommentInfo.insertOne`,
    COMMAND_POST_COMMENT_INFO_UPDATE_ONE : `postCommentInfo.updateOne`,
    COMMAND_POST_COMMENT_INFO_DELETE_ONE : `postCommentInfo.deleteOne`,

    COMMAND_STOCK_INFO_GET_CURRENCY_LIST : `stockInfo.getCurrencyList`,
    COMMAND_STOCK_INFO_GET_EXCHANGE_BY_CURRENCY : `stockInfo.getExchangeByCurrency`,
    COMMAND_STOCK_INFO_GET_LATEST_STOCK_INFO : `stockInfo.getLatestStockInfo`,
    COMMAND_STOCK_INFO_GET_REALTIME_STOCK_INFO : `stockInfo.getRealtimeStockInfo`,
    COMMAND_STOCK_INFO_GET_STOCK_INFO : `stockInfo.getStockInfo`,
    COMMAND_STOCK_GET_TICKER_INFO : `stockInfo.getTickerInfo`,
    COMMAND_STOCK_INFO_GET_TICKER_LIST : `stockInfo.getTickerList`,

    COMMAND_EDOC_COMPONENT_TEMPLATES_SELECT_ALL : `edocComponentTemplate.selectAll`,
    COMMAND_EDOC_DOCUMENT_UPSERT_ONE : `edocDocument.upsertOne`,
    COMMAND_EDOC_DOCUMENT_SELECT_ONE : `edocDocument.selectOne`,
    COMMAND_EDOC_DOCUMENT_DELETE_ONE : `edocDocument.deleteOne`,
    COMMAND_EDOC_DOCUMENT_SELECT_ALL : "edocDocument.slectAll",
}  

export const edoc = {
    COMPONENT_TYPE_TEXT : `text`,
    COMPONENT_TYPE_TABLE : `table`,
    COMPONENT_TYPE_IMAGE : `image`, 
    COMPONENT_TYPE_INPUT : `input`,
    COMPONENT_TYPE_CHECKLIST : "checklist",
}