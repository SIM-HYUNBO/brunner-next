`use strict`

import logger from "./winston/logger"
import * as database from "./biz/database/database"

// server modules.
import * as serviceSQL from './biz/serviceSQL'
import * as security from './biz/security'
import * as asset from './biz/asset'
import * as stock from './biz/stock'
import * as board from './biz/board'

async function initialize() {
    var serviceSql = null;
    if (!process.serviceSQL)
        serviceSql = await serviceSQL.loadAllSQL();
    else
        serviceSql = process.serviceSQL;

    return serviceSql.size;
}

var sql_loading = false;

export default async (req, res) => {
    const response = {};
    var remoteIp = null;
    var jRequest = null;
    var jResponse = null;
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
            throw Error("Server is now initializing...");
        }

        if (!process.serviceSQL || process.serviceSQL.length == 0) {
            throw Error("Server is now initializing...");
        }

        remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        jRequest = req.method === "GET" ? JSON.parse(req.params.requestJson) : req.method === "POST" ? req.body : null;
        txnId = await generateTxnId();
        commandName = jRequest.commandName;
        logger.warn(`START TXN ${commandName}\n`);
        req.body._txnId = txnId;
        logger.info(`method:${req.method} from ${remoteIp}\n requestBody:${JSON.stringify(req.body)}\n`);
        startTxnTime = new Date();

        jResponse = await executeService(req.method, req);
    }
    catch (e) {
        jResponse = e;
    }
    finally {
        endTxnTime = new Date();

        jResponse._txnId = txnId;
        durationMs = endTxnTime - startTxnTime;
        jResponse._durationMs = durationMs;
        res.send(`${JSON.stringify(jResponse)}`);

        await saveTxnHistory(remoteIp, txnId, jRequest, jResponse);
        logger.warn(`END TXN ${(!commandName) ? "" : commandName} in ${durationMs} milliseconds.\n`)
    }
}

const executeService = async (method, req) => {
    var jResponse = null;
    var jRequest = method === "GET" ? JSON.parse(req.params.requestJson) : method === "POST" ? req.body : null;
    const commandName = jRequest.commandName;

    if (commandName.startsWith('security.')) {
        jResponse = await security.executeService(req.body._txnId, jRequest);
    } else if (commandName.startsWith('serviceSQL.')) {
        jResponse = await serviceSQL.executeService(req.body._txnId, jRequest);
    } else if (commandName.startsWith('asset.')) {
        jResponse = await asset.executeService(req.body._txnId, jRequest);
    } else if (commandName.startsWith('stock.')) {
        jResponse = await stock.executeService(req.body._txnId, jRequest);
    } else if (commandName.startsWith('board.')) {
        jResponse = await board.executeService(req.body._txnId, jRequest);
    } else {
        jResponse = JSON.stringify({
            error_code: -1,
            error_message: `[${commandName}] not supported function`
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
    var sql = await serviceSQL.getSQL00('insert_TB_COR_TXN_HIST', 1);
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
        sql = await serviceSQL.getSQL00('delete_TB_COR_TXN_HIST', 1);
        var delete_TB_COR_TXN_HIST_01 = await database.executeSQL(sql,
            [
            ]);
        logger.info(`delete_TB_COR_TXN_HIST_01\n${delete_TB_COR_TXN_HIST_01.rowCount} rows deleted.`);
    }
}
