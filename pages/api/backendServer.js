import logger from "./winston/logger"

// server modules.
import serviceSQL from './biz/serviceSQL'
import security from './biz/security'

export default async (req, res) => {
    const response = {};
    var jResponse = null;
    var commandName = null;
    var txnId = null;
    var startTxnTime = null;
    var endTxnTime = null;
    var durationMs = null;

    try {
        var jRequest = req.method === "GET" ? JSON.parse(req.params.requestJson) : req.method === "POST" ? req.body : null;
        commandName = jRequest.commandName;
        var remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        logger.warn(`START TXN ${commandName}\n`);
        txnId = await generateTxnid();
        req.body._txnId = txnId;
        logger.info(`method:${req.method} from ${remoteIp}\n requestBody:${JSON.stringify(req.body)}\n`);

        startTxnTime = new Date();
        jResponse = await executeService(req.method, req);
    }
    catch (e) {
        jResponse = `${e}`;
    }
    finally {
        jResponse._txnId = txnId;
        endTxnTime = new Date();
        durationMs = endTxnTime - startTxnTime;      
        jResponse._durationMs = durationMs;
        res.send(`${JSON.stringify(jResponse)}`);
        logger.info(`reply:\n${JSON.stringify(jResponse)}\n`);
        logger.warn(`END TXN ${(!commandName) ? "" : commandName} in ${durationMs} milliseconds.\n`)
    }
}

const executeService = async (method, req) => {
    var jResponse = null;
    var jRequest = method === "GET" ? JSON.parse(req.params.requestJson) : method === "POST" ? req.body : null;
    const commandName = jRequest.commandName;

    if (commandName.startsWith('security.')) {
        jResponse = await new security(jRequest);
    } else if (commandName.startsWith('serviceSQL.')) {
        jResponse = await new serviceSQL(jRequest);
    } else {
        jResponse = JSON.stringify({
            error_code: -1,
            error_message: `[${commandName}] not supported function`
        })
    }
     return jResponse;
}

const generateTxnid = async () => {

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