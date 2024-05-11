import logger from "./winston/logger"

// server modules.
import security from './biz/security'

export default async (req, res) => {
    const response = {};
    var jResponse = null;
    var txnTime = null;

    try {
        logger.info(`\n\n>>>>>>>>>START TXN\n`)
        logger.info(`${req.method} data:${JSON.stringify(req.body)}`);

        // if (req.method === 'GET' || req.method === 'POST') {
        jResponse = await executeService(req.method, req);
        // }
        // else {
        //     res.setHeader('Allow', ['GET', 'POST']);
        //     res.status(405).end(`Method ${req.method} Not Allowed`);
        // }
    }
    catch (e) {
        jResponse = `${e}`;
    }
    finally {
        res.send(`${JSON.stringify(jResponse)}`);
        logger.info(`\n<<<<<<<<<<END TXN\n`)
    }
}

const executeService = async (method, req) => {
    var jRequest = method === "GET" ? JSON.parse(req.params.requestJson) : method === "POST" ? req.body : null;
    var jResponse = null;
    const commandName = jRequest.commandName;
    var remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    logger.info(`${method} request: ${JSON.stringify(jRequest)} from ${remoteIp}`);

    if (commandName.startsWith('security.')) {
        jResponse = await new security(req, jRequest);
    }
    else {
        jResponse = JSON.stringify({
            error_code: -1,
            error_message: `[${commandName}] not supported function`
        })
    }

    logger.info(`reply: ${JSON.stringify(jResponse)}`);
    return jResponse;
}