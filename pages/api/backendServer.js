import logger from "./winston/logger"

// server modules.
import serviceSQL from './biz/serviceSQL'
import security from './biz/security'

export default async (req, res) => {
    const response = {};
    var jResponse = null;
    var startTxnTime = null;
    var endTxnTime = null;
    var durationMs = null;
    var commandName = null;
    try {
        var jRequest = req.method === "GET" ? JSON.parse(req.params.requestJson) : req.method === "POST" ? req.body : null;
        commandName = jRequest.commandName;
        var remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        logger.warn(`START TXN ${commandName}\n`)
        logger.info(`method:${req.method} from ${remoteIp}\n data:${JSON.stringify(req.body)}\n`);
        startTxnTime = new Date();
        jResponse = await executeService(req.method, req);
    }
    catch (e) {
        jResponse = `${e}`;
    }
    finally {
        endTxnTime = new Date();
        durationMs = endTxnTime - startTxnTime;
        jResponse.durationMs = durationMs;      
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