`use strict`

export const
    EMPTY_STRING = '',

    SERVER_MESSAGE_DBF = "Database failed.",
    SERVER_MESSAGE_FIS = "The field value is required.",

    MESSAGE_CCS = "cannot connect to seerver",
    MESSAGE_UEO = "Unknown error occured.",
    MESSAGE_SISS = "Select or Input a stock symbol.",
    MESSAGE_INOA = "Invalid number or amount.",
    MESSAGE_DTI = "Delete this item?",
    MESSAGE_SDD = "Successfully deleted.",
    MESSAGE_YDHP = "You do not have permission",
    MESSAGE_SAD = "Successfully added.",
    MESSAGE_SSU = "successfully signed up.",
    MESSAGE_DWLO = "Do you want to logout now?",

    COMMAND_SECURITY_SIGNOUT = "security.signout",
    COMMAND_SECURITY_RESET_PASSWORD = "security.resetPassword",
    COMMAND_SERVICESQL_LOAD_ALL_SQL = "serviceSQL.loadAllSQL",
    COMMAND_SECURITY_SIGNUP = "security.signup",
    COMMAND_BOARD_GET_POST_LIST = "board.getPostList",
    COMMAND_BOARD_ADD_POST = "board.addPost",
    COMMAND_BOARD_EDIT_POST = "board.editPost",
    COMMAND_PDP = "board.deletePost",
    COMMAND_BAC = "board.addPostComment",
    COMMAND_BEC = "board.editPostComment",
    COMMAND_BDC = "board.deletePostComment"