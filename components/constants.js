`use strict`

export const
    EMPTY_STRING = '',
    MESSAGE_UNKNOWN_ERROR = `Unknown error occured.`,
    MESSAGE_SUCCESS_SIGNUP = `successfully signed up.`,
    MESSAGE_SIGNOUT = `Do you want to signout now?`,
    MESSAGE_REQUIRED_FIELD = `The field value is required.`,
    MESSAGE_SERVER_NOW_INITIALIZING = "Server is now initializing...",

    SERVER_MESSAGE_DATABASE_FAILED = `Database failed.`,
    SERVER_NOT_SUPPORTED_MODULE = `not supported module`,
    SERVER_SQL_NOT_LOADED = `Service SQL not loaded.`,

    MESSAGE_SERVER_NOT_CONNECTTED = `cannot connect to seerver`,
    MESSAGE_INPUT_STOCK_SYMBOL = `Select or Input a stock symbol.`,
    MESSAGE_INVALIED_NUMBER_AMOUNT = `Invalid number or amount.`,
    MESSAGE_DELETE_ITEM = `Delete this item?`,
    MESSAGE_SUCCESS_DELETED = `Successfully deleted.`,
    MESSAGE_NO_PERMISSION = `You do not have permission`,
    MESSAGE_SUCCESS_ADDED = `Successfully added.`,
    MESSAGE_SUCCESS_SAVED = `Successfully saved.`,

    COMMAND_ASSET_ADD_INCOME = `asset.addIncome`,
    COMMAND_ASSET_DELETE_INCOME = `asset.deleteIncome`,
    COMMAND_ASSET_GET_INCOME_HISTORY = `asset.getIncomeHistory`,
    COMMAND_ASSET_UPDATE_INCOME = `asset.updateIncome`,

    COMMAND_BOARD_ADD_POST = `board.addPost`,
    COMMAND_BOARD_ADD_COMMENT = `board.addPostComment`,
    COMMAND_BOARD_DELETE_POST = `board.deletePost`,
    COMMAND_BOARD_DELETE_COMMENT = `board.deletePostComment`,
    COMMAND_BOARD_EDIT_POST = `board.editPost`,
    COMMAND_BOARD_EDIT_COMMENT = `board.editPostComment`,
    COMMAND_BOARD_GET_POST_LIST = `board.getPostList`,

    COMMAND_SERVICESQL_LOAD_ALL_SQL = `serviceSQL.loadAllSQL`,
    COMMAND_SERVICESQL_GET_ALL_SQL = `serviceSQL.getAllSQL`,
    COMMAND_SERVICESQL_UPDATE_SERVICE_SQL = `serviceSQL.updateServiceSQL`,
    COMMAND_SERVICESQL_DELETE_SERVICE_SQL = `serviceSQL.deleteServiceSQL`,

    COMMAND_SECURITY_SEND_EMAIL_AUTHCODE = `security.sendEMailAuthCode`,
    COMMAND_SECURITY_RESET_PASSWORD = `security.resetPassword`,
    COMMAND_SECURITY_SIGNOUT = `security.signout`,
    COMMAND_SECURITY_SIGNUP = `security.signup`,
    COMMAND_SECURITY_SIGNIN = `security.signin`,
    COMMAND_SECURITY_DELETE_ACCOUNT = `security.deleteAccount`,
    COMMAND_STOCK_GET_TICKER_LIST = `stock.getTickerList`,
    COMMAND_STOCK_GET_TICKER_INFO = `stock.getTickerInfo`,
    COMMAND_STOCK_GET_STOCK_INFO = `stock.getStockInfo`,
    COMMAND_STOCK_GET_LATEST_STOCK_INFO = `stock.getLatestStockInfo`,
    COMMAND_STOCK_GET_REALTIME_STOCK_INFO = `stock.getRealtimeStockInfo`

