`use strict`

import logger from "./../winston/logger"
import * as database from './database/database'
import * as TB_COR_USER_MST from './database/sqls/TB_COR_USER_MST'

export default function executeService(req, jRequest) {
    var jResponse = {};

    try {
        const dbConnectionPool = database.getPool();

        switch (jRequest.commandName) {
            case "security.signup":
                jResponse = signup(dbConnectionPool, req, jRequest);
                break;
            case "security.signin":
                jResponse = signin(dbConnectionPool, req, jRequest);
                break;
            case "security.signout":
                jResponse = signout(dbConnectionPool, req, jRequest);
                break;
            case "security.resetPassword":
                jResponse = resetPassword(dbConnectionPool, req, jRequest);
                break;
            default:
                break;
        }
    } catch (error) {
        logger.error(error);
    } finally {
        return jResponse;
    }
}

const signup = async (promisePool, req, jRequest) => {
    var jResponse = {};
    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.userId = jRequest.userId;
        jResponse.password = jRequest.password;

        if (!jRequest.userId) {
            jResponse.error_code = -2;
            jResponse.error_message = `[userId] is missing.`;
            return jResponse;
        }
        if (jRequest.userId.length < 5 || jRequest.userId.length > 10) {
            jResponse.error_code = -2;
            jResponse.error_message = `[userId] length should be from 5 to 10.`;
            return jResponse;
        }
        if (!jRequest.password) {
            jResponse.error_code = -2;
            jResponse.error_message = `[password] is missing.`;
            return jResponse;
        }
        if (jRequest.password.length < 5) {
            jResponse.error_code = -2;
            jResponse.error_message = `[password] length should be more than 5.`;
            return jResponse;
        }
        if (!jRequest.userName) {
            jResponse.error_code = -2;
            jResponse.error_message = `[userName] is missing.`;
            return jResponse;
        }
        if (jRequest.userName.length < 2 || jRequest.userName.length > 10) {
            jResponse.error_code = -2;
            jResponse.error_message = `[password] length should be from 2 to 10.`;
            return jResponse;
        }
        if (!jRequest.phoneNumber) {
            jResponse.error_code = -2;
            jResponse.error_message = `[phoneNumber] is missing.`;
            return jResponse;
        }
        if (validTelNo(jRequest.phoneNumber) == false) {
            jResponse.error_code = -2;
            jResponse.error_message = `[phoneNumber] is not valid.`;
            return jResponse;
        }
        if (!jRequest.email) {
            jResponse.error_code = -2;
            jResponse.error_message = `[email] is missing.`;
            return jResponse;
        }
        if (validEMail(jRequest.email) == false) {
            jResponse.error_code = -2;
            jResponse.error_message = `[email] is not valid.`;
            return jResponse;
        }
        if (!jRequest.registerNo) {
            jResponse.error_code = -2; // incorrect user info 
            jResponse.error_message = `[registerNo] is missing.`;
            return jResponse;
        }
        if (!jRequest.address) {
            jResponse.error_code = -2; // incorrect user info 
            jResponse.error_message = `[address] is missing.`;
            return jResponse;
        }

        await database.querySQL(promisePool,
            TB_COR_USER_MST.select_TB_COR_USER_MST_01,
            [
                jRequest.userId
            ]).then((result) => {
                logger.info(`RESULT:\n${JSON.stringify(result)}`);

                if (result.rowCount > 0) {
                    jResponse.error_code = -1;
                    jResponse.error_message = `The user Id is already using.`;
                    return jResponse;
                }
                else {
                    jResponse.error_code = 0;
                    jResponse.error_message = ``;
                }
            }).catch((e) => {
                jResponse.error_code = -3; // exception
                jResponse.error_message = e;
            }).finally(() => {
                // logger.info(jResponse);
            });

        if (jResponse.error_code < 0) {
            return jResponse;
        }

        await database.executeSQL(promisePool,
            TB_COR_USER_MST.insert_TB_COR_USER_MST_01,
            [
                jRequest.systemCode,
                jRequest.userId,
                jRequest.password,
                jRequest.userName,
                jRequest.address,
                jRequest.phoneNumber,
                jRequest.email,
                jRequest.registerNo,
                'Y',
                process.env.SYSTEM_USER_ID
            ]).then((result) => {
                logger.info(`RESULT:\n${JSON.stringify(result)}`);
                if (result.rowCount == 1) {
                    jResponse.error_code = 0;
                    jResponse.error_message = `ok`;
                }
                else {
                    jResponse.error_code = -3;
                    jResponse.error_message = `database failed.`;
                }
            }).catch((e) => {
                logger.error(`CATCH:\n${e}`);
                jResponse.error_code = -3; // exception
                jResponse.error_message = e;
            }).finally(() => {
                // logger.info(jResponse);
            });
        // }
    } catch (e) {
        logger.error(`CATCH:\n${e}`);
    } finally {
        return jResponse;
    }
};

const signin = async (promisePool, req, jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.userId = jRequest.userId;
    jResponse.password = jRequest.password;

    logger.info(`session info ${JSON.stringify(req.session)}`);

    if (req.session && req.session.userInfo) {
        logger.info(`session에 이미 로그인 정보가 있음. ${JSON.stringify(req.session.userInfo)}`);
        jResponse.userInfo = req.session.userInfo;
    } else {
        logger.info(`session에 로그인 정보가 없음.`);

        await database.querySQL(promisePool,
            TB_COR_USER_MST.select_TB_COR_USER_MST_01,
            [
                jRequest.userId
            ]).then((result) => {
                if (result.rows.length == 1) {
                    logger.info(`RESULT:\n${JSON.stringify(result.rows[0])}`);
                    logger.info(`${result.rows[0].password},${jRequest.password}`)
                    if (result.rows[0].password === jRequest.password) {
                        jResponse.error_code = 0;
                        jResponse.error_message = `OK`;
                    } else {
                        jResponse.error_code = -1; // incorrect password 
                        jResponse.error_message = `incorrect password`;
                    }
                } else {
                    jResponse.error_code = -2; // incorrect user info 
                    jResponse.error_message = `incorrect user info`;
                }
            }).catch((e) => {
                jResponse.error_code = -3; // exception
                jResponse.error_message = e;
            }).finally(() => {
                logger.info(jResponse);
            });
    }

    return jResponse;
};

const resetPassword = async (promisePool, req, jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.userId = jRequest.userId;

    if (jRequest.userId === '') {
        jResponse.error_code = -2;
        jResponse.error_message = `the userId field value is missing.`;
        return jResponse;
    }
    if (jRequest.registerNo === '') {
        jResponse.error_code = -2;
        jResponse.error_message = `the registerNo field value is missing.`;
        return jResponse;
    }
    if (jRequest.phoneNumber === '') {
        jResponse.error_code = -2;
        jResponse.error_message = `the phoneNumber field value is missing.`;
        return jResponse;

    }
    if (jRequest.newPassword === '') {
        jResponse.error_code = -2;
        jResponse.error_message = `the newPassword field value is missing.`;
        return jResponse;
    }
    if (jRequest.confirmPassword === '') {
        jResponse.error_code = -2;
        jResponse.error_message = `the confirmPassword field value is missing.`;
        return jResponse;

    }
    if (jRequest.newPassword !== jRequest.confirmPassword) {
        jResponse.error_code = -2;
        jResponse.error_message = `the newPassword and confirmPassword fields value are not same.`;
        return jResponse;
    }

    await database.executeSQL(promisePool,
        TB_COR_USER_MST.update_TB_COR_USER_MST_01,
        [
            jRequest.newPassword,
            jRequest.userId,
            jRequest.registerNo,
            jRequest.phoneNumber,
            jRequest.newPassword
        ]).then((result) => {
            logger.info(`RESULT:\n${result}`);

            if (result[0].affectedRows == 1) {
                jResponse = result[0];
            } else {
                jResponse.error_code = -2;
                jResponse.error_message = `database error occured.`;
            }
        }).catch((e) => {
            logger.info(`${e}`);
            jResponse.error_code = -3; // exception
            jResponse.error_message = e;
        }).finally(() => {
            // logger.info(jResponse);
        });

    return jResponse;
};

const signout = (promisePool, req, jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;

    jResponse.error_code = 0;
    jResponse.error_message = `ok`;
    req.session.userInfo = {};
    req.session.save(() => {
        logger.info(`session에 사용자 정보 삭제함.`);
        logger.info(`session info ${JSON.stringify(req.session)}`);
    });

    return jResponse;
};

const validTelNo = (args) => {
    const msg = '유효하지 않는 전화번호입니다.';
    // IE 브라우저에서는 당연히 var msg로 변경

    if (/^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/.test(args)) {
        return true;
    }
    // alert(msg);
    return false;
}

const validEMail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}