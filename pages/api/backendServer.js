`use strict`

import logger from "./winston/logger"
import * as constants from "@/components/constants"
import * as database from "./biz/database/database"
import * as tb_cor_sql_info from './biz/tb_cor_sql_info'
import * as tb_cor_user_mst from './biz/tb_cor_user_mst'
import * as tb_cor_income_hist from './biz/tb_cor_income_hist'
import * as tb_cor_ticker_info from './biz/tb_cor_ticker_info'
import * as tb_cor_post_info from './biz/tb_cor_post_info'
import * as tb_cor_post_comment_info from './biz/tb_cor_post_comment_info'

async function initialize() {
    var serviceSql = null;
    if (!process.serviceSQL)
        serviceSql = await tb_cor_sql_info.loadAll();
    else
        serviceSql = process.serviceSQL;

    return serviceSql.size;
}

var sql_loading = false;

export default async (req, res) => {
    var response = null;
    var remoteIp = null;
    var jRequest = null;
    var jResponse = {};
    var commandName = null;
    var txnId = null;
    var startTxnTime = null;
    var endTxnTime = null;
    var durationMs = null;

    try {
        var loadedSQLSize = 0;

        if (!sql_loading) {
            loadedSQLSize = await initialize();
        }
        else {
            throw Error(constants.messages.MESSAGE_SERVER_NOW_INITIALIZING);
        }

        if (!process.serviceSQL || process.serviceSQL.length == 0) {
            throw Error(constants.messages.MESSAGE_SERVER_NOW_INITIALIZING);
        }

        remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        jRequest = req.method === "GET" ? JSON.parse(req.params.requestJson) : req.method === "POST" ? req.body : null;
        txnId = await generateTxnId();
        commandName = jRequest.commandName;
        logger.warn(`START TXN ${commandName}\n`);
        jRequest._txnId = txnId;
        logger.info(`method:${req.method} from ${remoteIp}\n requestBody:${JSON.stringify(req.body)}\n`);
        startTxnTime = new Date();

        response = await executeService(req.method, req);
        if(response && constants.isJsonObject(response))
            jResponse= response;
        else
            jResponse = JSON.parse(response.toString())
    }
    catch (e) {
        logger.error(`${e}\n`);
        jResponse = e;
    }
    finally {
        endTxnTime = new Date();
        durationMs = endTxnTime - startTxnTime;
        
        jResponse._txnId = txnId;
        jResponse._durationMs = durationMs;

        res.send(`${JSON.stringify(jResponse)}`);

        if (commandName !== constants.commands.COMMAND_STOCK_GET_REALTIME_STOCK_INFO)
            await saveTxnHistory(remoteIp, txnId, jRequest, jResponse);

        logger.warn(`END TXN ${(!commandName) ? "" : commandName} in ${durationMs} milliseconds.\n response: ${JSON.stringify(jResponse)}\n`)
    }
}

const executeService = async (method, req) => {
    var jResponse = null;
    var jRequest = method === "GET" ? JSON.parse(req.params.requestJson) : method === "POST" ? req.body : null;
    const commandName = jRequest.commandName;

    if (commandName.startsWith('tb_cor_user_mst.')) {
        jResponse = await tb_cor_user_mst.executeService(req.body._txnId, jRequest);
    } else if (commandName.startsWith('tb_cor_sql_info.')) {
        jResponse = await tb_cor_sql_info.executeService(req.body._txnId, jRequest);
    } else if (commandName.startsWith('tb_cor_income_hist.')) {
        jResponse = await tb_cor_income_hist.executeService(req.body._txnId, jRequest);
    } else if (commandName.startsWith('tb_cor_ticker_info.')) {
        jResponse = await tb_cor_ticker_info.executeService(req.body._txnId, jRequest);
    } else if (commandName.startsWith('tb_cor_post_info.')) {
        jResponse = await tb_cor_post_info.executeService(req.body._txnId, jRequest);
    } else if (commandName.startsWith('tb_cor_post_comment_info.')) {
        jResponse = await tb_cor_post_comment_info.executeService(req.body._txnId, jRequest);
    } else {
        jResponse = JSON.stringify({
            error_code: -1,
            error_message: `[${commandName}] ${constants.messages.MESSAGE_SERVER_NOT_SUPPORTED_MODULE}`
        })
    }
    return jResponse;
}

const generateTxnId = async () => {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const currentDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;

    const hrtime = process.hrtime(); // 현재 시간을 나노초 단위로 가져옴
    const txnid = `${currentDateTime}${hrtime[0]}${hrtime[1]}`;
    return txnid;
}

const saveTxnHistory = async (remoteIp, txnId, jRequest, jResponse) => {
    var sql = await tb_cor_sql_info.getSQL00('insert_TB_COR_TXN_HIST', 1);
    var insert_TB_COR_TXN_HIST_01 = await database.executeSQL(sql,
        [
            txnId,
            remoteIp,
            JSON.stringify(jRequest, null, 2),
            JSON.stringify(jResponse, null, 2),
        ]);

    if (insert_TB_COR_TXN_HIST_01.rowCount !== 1) {
        logger.error(`Failed to execute insert_TB_COR_TXN_HIST_01\n`);
    }
    else {
        // 오래된 이력은 여기서 삭제
        sql = await tb_cor_sql_info.getSQL00('delete_TB_COR_TXN_HIST', 1);
        var delete_TB_COR_TXN_HIST_01 = await database.executeSQL(sql,
            [
            ]);
        logger.info(`delete_TB_COR_TXN_HIST_01\n${delete_TB_COR_TXN_HIST_01.rowCount} rows deleted.`);
    }
}
