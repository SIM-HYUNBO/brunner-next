import logger from "./winston/logger"

// server modules.
import security from './biz/security'

export default async (req, res) => {
    const response = {};
    var jResponse = null;
    var txnTime = null;
    var commandName = null;
    try {
        var jRequest = req.method === "GET" ? JSON.parse(req.params.requestJson) : req.method === "POST" ? req.body : null;
        commandName = jRequest.commandName;
        var remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        logger.warn(`START TXN ${commandName}\n`)
        logger.info(`method:${req.method} from ${remoteIp}\n data:${JSON.stringify(req.body)}\n`);
        jResponse = await executeService(req.method, req);
    }
    catch (e) {
        jResponse = `${e}`;
    }
    finally {
        res.send(`${JSON.stringify(jResponse)}`);
        logger.warn(`END TXN ${(!commandName) ? "" : commandName}\n`)
    }
}

const executeService = async (method, req) => {
    var jResponse = null;
    var jRequest = method === "GET" ? JSON.parse(req.params.requestJson) : method === "POST" ? req.body : null;
    const commandName = jRequest.commandName;

    if (commandName.startsWith('security.')) {
        jResponse = await new security(req, jRequest);
    }
    else {
        jResponse = JSON.stringify({
            error_code: -1,
            error_message: `[${commandName}] not supported function`
        })
    }

    logger.info(`reply:\n${JSON.stringify(jResponse)}\n`);
    return jResponse;
}