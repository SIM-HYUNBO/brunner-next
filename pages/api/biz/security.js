`use strict`

import logger from "./../winston/logger"
import * as database from `./database/database`
import * as serviceSQL from `./serviceSQL`

export default function executeService(txnId, jRequest) {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case "security.signup":
                jResponse = signup(txnId, jRequest);
                break;
            case "security.signin":
                jResponse = signin(txnId, jRequest);
                break;
            case "security.signout":
                jResponse = signout(txnId, jRequest);
                break;
            case "security.resetPassword":
                jResponse = resetPassword(txnId, jRequest);
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

const signup = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.userId = jRequest.userId;
        jResponse.password = jRequest.password;

        if (!jRequest.userId) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [userId] is a required field. 
            Please enter a value.`;
            return jResponse;
        }
        if (jRequest.userId.length < 5 || jRequest.userId.length > 10) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [userId] length should be from 5 to 10.`;
            return jResponse;
        }
        if (!jRequest.password) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [password] is a required field. 
            Please enter a value.`;
            return jResponse;
        }
        if (jRequest.password.length < 5) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [password] length should be more than 5.`;
            return jResponse;
        }
        if (!jRequest.userName) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [userName] is a required field. 
            Please enter a value.`;
            return jResponse;
        }
        if (jRequest.userName.length < 2 || jRequest.userName.length > 10) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [password] length should be from 2 to 10.`;
            return jResponse;
        }
        if (!jRequest.phoneNumber) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [phoneNumber] is a required field. 
            Please enter a value.`;
            return jResponse;
        }
        if (verifyTelNo(jRequest.phoneNumber) == false) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [phoneNumber] is not valid.`;
            return jResponse;
        }
        if (!jRequest.email) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [email] is a required field. 
            Please enter a value.`;
            return jResponse;
        }
        if (verifyEMail(jRequest.email) == false) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [email] is not valid.`;
            return jResponse;
        }
        if (!jRequest.registerNo) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [registerNo] is a required field. 
            Please enter a value.`;
            return jResponse;
        }
        if (!jRequest.address) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [address] is a required field. 
            Please enter a value.`;
            return jResponse;
        }

        var sql = serviceSQL.getSQL00(`select_TB_COR_USER_MST`, 1);
        var select_TB_COR_USER_MST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId
            ]);

        if (select_TB_COR_USER_MST_01.rowCount > 0) {
            jResponse.error_code = -1;
            jResponse.error_message = `The user id is already used.`;
            return jResponse;
        }

        sql = serviceSQL.getSQL00(`insert_TB_COR_USER_MST`, 1);
        var insert_TB_COR_USER_MST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId,
                jRequest.password,
                jRequest.userName,
                jRequest.address,
                jRequest.phoneNumber,
                jRequest.email,
                `Y`,
                jRequest.userId,
                jRequest.registerNo,
            ]);

        logger.info(`\nRESULT:rowCount=\n${insert_TB_COR_USER_MST_01.rowCount}\n`);

        if (insert_TB_COR_USER_MST_01.rowCount == 1) {
            jResponse.error_code = 0;
            jResponse.error_message = "";
        }
        else {
            jResponse.error_code = -3;
            jResponse.error_message = `Failed to create new user.\n`
        }
    } catch (e) {
        logger.error(`EXCEPTION:\n${e}`);
        jResponse.error_code = -3; // exception
        jResponse.error_message = `EXCEPTION:\n${e}`;
    } finally {
        return jResponse;
    }
};

const signin = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = serviceSQL.getSQL00(`select_TB_COR_USER_MST`, 1);
        var select_TB_COR_USER_MST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId
            ]);

        if (select_TB_COR_USER_MST_01.rows.length == 1) {
            logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_USER_MST_01.rows[0])}\n`);

            if (select_TB_COR_USER_MST_01.rows[0].password === jRequest.password) {
                jResponse.error_code = 0;
                jResponse.error_message = "";

                jResponse.userId = select_TB_COR_USER_MST_01.rows[0].user_id;
                jResponse.userName = select_TB_COR_USER_MST_01.rows[0].user_name;
            } else {
                jResponse.error_code = -1;
                jResponse.error_message = `Incorrect password`;
            }
        } else {
            jResponse.error_code = -2;
            jResponse.error_message = `Incorrect user info`;
        }
    } catch (e) {
        logger.error(`EXCEPTION:\n${e}`);
        jResponse.error_code = -3; // exception
        jResponse.error_message = `EXCEPTION:\n${e}`;
    } finally {
        return jResponse;
    }
};

const resetPassword = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.userId = jRequest.userId;

        if (jRequest.userId === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [userId] field is a required field. 
            Please enter a value.`;
            return jResponse;
        }
        if (jRequest.registerNo === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [registerNo] field is a required field. 
            Please enter a value.`;
            return jResponse;
        }
        if (jRequest.phoneNumber === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [phoneNumber] field is a required field. 
            Please enter a value.`;
            return jResponse;

        }
        if (jRequest.newPassword === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [newPassword] field is a required field. 
            Please enter a value.`;
            return jResponse;
        }
        if (jRequest.confirmPassword === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [confirmPassword] field is a required field. 
            Please enter a value.`;
            return jResponse;

        }
        if (jRequest.newPassword !== jRequest.confirmPassword) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [newPassword] and [confirmPassword] field values are not same.`;
            return jResponse;
        }

        var sql = serviceSQL.getSQL00(promisePool, `select_TB_COR_USER_MST`, 1);
        var select_TB_COR_USER_MST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId
            ]);

        if (select_TB_COR_USER_MST_01.rowCount === 1) {
            logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_USER_MST_01.rows[0])}\n`);
        }
        else if (select_TB_COR_USER_MST_01.rowCount <= 0) {
            jResponse.error_code = -1;
            jResponse.error_message = `The user Id not exist.`;
            return jResponse;
        }

        // logger.info(`OLD PASSWORD:${select_TB_COR_USER_MST_01.rows[0].password} NEW PASSWORD: ${jRequest.newPassword}\n`);

        if (select_TB_COR_USER_MST_01.rows[0].password === jRequest.newPassword) {
            jResponse.error_code = -1;
            jResponse.error_message = `The new password is same with current one.`;
            jResponse.rowCount = 0;
            return jResponse;
        }
        else {
            var sql = serviceSQL.getSQL00(promisePool, `update_TB_COR_USER_MST`, 1);
            var update_TB_COR_USER_MST_01 = await database.executeSQL(sql,
                [
                    jRequest.newPassword,
                    jRequest.systemCode,
                    jRequest.userId,
                    jRequest.registerNo,
                    jRequest.phoneNumber,
                    jRequest.newPassword
                ]);

            logger.info(`RESULT: rowCount=${update_TB_COR_USER_MST_01.rowCount}\n`);
            if (update_TB_COR_USER_MST_01.rowCount == 1) {
                jResponse.error_code = 0;
                jResponse.error_message = `The password successfully changed.`;
                logger.info(`RESULT:\n${JSON.stringify(jResponse)}\n`);
            } else {
                jResponse.error_code = -2;
                jResponse.error_message = `Failed to reset password. 
                Please check the phone number and register number.`;
            }
        }
    } catch (e) {
        logger.error(`EXCEPTION:\n${e}`);
        jResponse.error_code = -3; // exception
        jResponse.error_message = `EXCEPTION:\n${e}`;
    } finally {
        return jResponse;
    }
};

const signout = (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;

        jResponse.error_code = 0;
        jResponse.error_message = "";
    } catch (e) {
        logger.error(`EXCEPTION:\n${e}`);
        jResponse.error_code = -3; // exception
        jResponse.error_message = `EXCEPTION:\n${e}`;
    } finally {
        return jResponse;
    }
};

const verifyTelNo = (args) => {
    const msg = `유효하지 않는 전화번호입니다.`;
    // IE 브라우저에서는 당연히 var msg로 변경

    if (/^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/.test(args)) {
        return true;
    }
    return false;
}

const verifyEMail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}