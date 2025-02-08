`use strict`

export function isJsonObject(obj) {
    return obj && typeof obj === 'object' && !Array.isArray(obj);
}

export const messages = {    
    EMPTY_STRING : '',
    MESSAGE_DATABASE_FAILED : `Database failed.`,
    MESSAGE_DELETE_ITEM : `Delete this item?`,
    MESSAGE_INPUT_STOCK_SYMBOL : `Select or Input a stock symbol.`,
    MESSAGE_INVALIED_NUMBER_AMOUNT : `Invalid number or amount.`,
    MESSAGE_NO_PERMISSION : `You do not have permission`,
    MESSAGE_REQUIRED_FIELD : `The field value is required.`,
    MESSAGE_SERVER_NOT_CONNECTTED : `cannot connect to seerver`,
    MESSAGE_SERVER_NOT_SUPPORTED_MODULE : `not supported module`,
    MESSAGE_SERVER_NOW_INITIALIZING : "Server is now initializing...",
    MESSAGE_SERVER_SQL_NOT_LOADED : `Service SQL not loaded.`,
    MESSAGE_SIGNOUT : `Do you want to signout now?`,
    MESSAGE_SUCCESS_ADDED : `Successfully added.`,
    MESSAGE_SUCCESS_DELETED : `Successfully deleted.`,
    MESSAGE_UNKNOWN_ERROR : `Unknown error occured.`,
    MESSAGE_SUCCESS_SAVED : `Successfully saved.`,
    MESSAGE_SUCCESS_SIGNUP : `successfully signed up.`
}

export const commands = {
    COMMAND_TB_COR_INCOME_HIST_INSERTONE : `tb_cor_income_hist.insertOne`,
    COMMAND_TB_COR_INCOME_HIST_DELETEONE : `tb_cor_income_hist.deleteOne`,
    COMMAND_TB_COR_INCOME_HIST_SELECTBYUSERID : `tb_cor_income_hist.selectByUserId`,
    COMMAND_TB_COR_INCOME_HIST_UPDATEONE : `tb_cor_income_hist.updateOne`,

    COMMAND_TB_COR_POST_INFO_INSERTONE : `tb_cor_post_info.insertOne`,
    COMMAND_TB_COR_POST_INFO_UPDATEONE : `tb_cor_post_info.updateOne`,
    COMMAND_TB_COR_POST_INFO_DELETEONE : `tb_cor_post_info.deleteOne`,
    COMMAND_TB_COR_POST_INFO_SELECTALL : `tb_cor_post_info.selectAll`,

    COMMAND_TB_COR_POST_COMMENT_INFO_INSERTONE : `tb_cor_post_comment_info.insertOne`,
    COMMAND_TB_COR_POST_COMMENT_INFO_UPDATEONE : `tb_cor_post_comment_info.updateOne`,
    COMMAND_TB_COR_POST_COMMENT_INFO_DELETEONE : `tb_cor_post_comment_info.deleteOne`,

    COMMAND_STOCK_GET_CURRENCY_LIST : `tb_cor_ticker_info.getCurrencyList`,
    COMMAND_STOCK_GET_EXCHANGE_BY_CURRENCY : `tb_cor_ticker_info.getExchangeByCurrency`,
    COMMAND_STOCK_GET_LATEST_STOCK_INFO : `tb_cor_ticker_info.getLatestStockInfo`,
    COMMAND_STOCK_GET_REALTIME_STOCK_INFO : `tb_cor_ticker_info.getRealtimeStockInfo`,
    COMMAND_STOCK_GET_STOCK_INFO : `tb_cor_ticker_info.getStockInfo`,
    COMMAND_STOCK_GET_TICKER_INFO : `tb_cor_ticker_info.getTickerInfo`,
    COMMAND_STOCK_GET_TICKER_LIST : `tb_cor_ticker_info.getTickerList`,

    COMMAND_SECURITY_DELETE_ACCOUNT : `tb_cor_user_mst.deleteAccount`,
    COMMAND_SECURITY_RESET_PASSWORD : `tb_cor_user_mst.resetPassword`,
    COMMAND_SECURITY_SEND_EMAIL_AUTHCODE : `tb_cor_user_mst.sendEMailAuthCode`,
    COMMAND_SECURITY_SIGNOUT : `tb_cor_user_mst.signout`,
    COMMAND_SECURITY_SIGNUP : `tb_cor_user_mst.signup`,
    COMMAND_SECURITY_SIGNIN : `tb_cor_user_mst.signin`,

    COMMAND_TB_COR_SQL_INFO_SELECTALL : `tb_cor_sql_info.selectAll`,
    COMMAND_TB_COR_SQL_INFO_UPDATEONE : `tb_cor_sql_info.updateOne`,
    COMMAND_TB_COR_SQL_INFO_DELETEONE : `tb_cor_sql_info.deleteOne`,
    COMMAND_TB_COR_SQL_INFO_LOADALL : `tb_cor_sql_info.loadAll` 
}  