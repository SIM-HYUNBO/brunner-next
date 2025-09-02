`use strict`

import logger from "../winston/logger"
import * as constants from '@/components/constants'
import * as database from "./database/database"
import * as dynamicSql from "./dynamicSql"
import * as mailSender from '@/components/mailSender'

import bcrypt from "bcryptjs"

const executeService = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case constants.commands.SECURITY_SIGNUP:
                jResponse = await signup(txnId, jRequest);
                break;
            case constants.commands.SECURITY_SIGNIN:
                jResponse = await signin(txnId, jRequest);
                break;
            case constants.commands.SECURITY_SIGNOUT:
                jResponse = await signout(txnId, jRequest);
                break;
            case constants.commands.SECURITY_RESET_PASSWORD:
                jResponse = await resetPassword(txnId, jRequest);
                break;
            case constants.commands.SECURITY_DELETE_ACCOUNT:
                jResponse = await deleteAccount(txnId, jRequest);
                break;
            case constants.commands.SECURITY_SEND_EMAIL_AUTHCODE:
                jResponse = await sendEMailAuthCode(txnId, jRequest);
                break;
            default:
                break;
        }
    } catch (error) {
        logger.error(`message:${error.message}\n stack:${error.stack}\n`);
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
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId`;
            return jResponse;
        }
        if (jRequest.userId.length < 5 || jRequest.userId.length > 10) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.USER_ID_LENGTH_CHECK}`;
            return jResponse;
        }
        if (!jRequest.password) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [password]`;
            return jResponse;
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(jRequest.password, 10);

        if (jRequest.password.length < 5) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.USER_PASSWORD_LENGTH_CHECK}`;
            return jResponse;
        }
        if (!jRequest.userName) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userName]`;
            return jResponse;
        }
        if (jRequest.userName.length < 2 || jRequest.userName.length > 10) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.USER_NAME_LENGTH_CHECK}`;
            return jResponse;
        }
        if (!jRequest.phoneNumber) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [phoneNumber]`;
            return jResponse;
        }
        if (verifyTelNo(jRequest.phoneNumber) == false) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [phoneNumber] is not valid.`;
            return jResponse;
        }
        if (!jRequest.email) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [email]`;
            return jResponse;
        }
        if (verifyEMail(jRequest.email) == false) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.EMAIL_NOT_VALID}`;
            return jResponse;
        }
        if (!jRequest.registerNo) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [registerNo]`;
            return jResponse;
        }
        if (!jRequest.address) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [address]`;
            return jResponse;
        }

        var sql = await dynamicSql.getSQL00(`select_TB_COR_USER_MST`, 1);
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

        sql = await dynamicSql.getSQL00(`insert_TB_COR_USER_MST`, 1);
        var insert_TB_COR_USER_MST_01 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId,
                hashedPassword, // 해싱된 비밀번호를 db에 저장 
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
            jResponse.error_message = constants.messages.EMPTY_STRING;
        }
        else {
            jResponse.error_code = -3;
            jResponse.error_message = `Failed to create new user.\n`
        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const signin = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;

        var sql = null
        sql = await dynamicSql.getSQL00(`select_TB_COR_USER_MST`, 2);
        var select_TB_COR_USER_MST_02 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId
            ]);

        if (select_TB_COR_USER_MST_02.rows.length == 1) {
            logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_USER_MST_02.rows[0])}\n`);

            // 비밀번호 비교
            const storedHashedPassword = select_TB_COR_USER_MST_02.rows[0].password;

            logger.warn(`PASSWORD Comparing:\n${jRequest.password} and ${storedHashedPassword}\n`);
            const isMatch = await bcrypt.compare(jRequest.password, storedHashedPassword);
            if (isMatch) {
                logger.warn(`PASSWORD MATCH\n`);

                jResponse.error_code = 0;
                jResponse.error_message = constants.messages.EMPTY_STRING;

                jResponse.userId = select_TB_COR_USER_MST_02.rows[0].user_id;
                jResponse.userName = select_TB_COR_USER_MST_02.rows[0].user_name;
                jResponse.adminFlag = select_TB_COR_USER_MST_02.rows[0].admin_flag;

                // New User login report mail send
                mailSender.sendEmail({
                    from: 'brunner-admin@brunner-next.com', // 발신자 이메일 주소
                    to: 'hbsim0605@gmail.com',  // 관리자 이메일 주소
                    subject: '[brunner-next] New user signed in',
                    text: `New user signed in. ID: ${jResponse.userId}` // 이메일 본문
                })
            } else {
                jResponse.error_code = -1;
                jResponse.error_message = `Incorrect password`;
            }
        } else {
            jResponse.error_code = -2;
            jResponse.error_message = `Incorrect user info`;
        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        logger.warn(`return ${JSON.stringify(jResponse)}\n`);
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
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
            return jResponse;
        }
        if (jRequest.phoneNumber === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [phoneNumber]`;
            return jResponse;

        }

        if (jRequest.authCode === '') {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [authCode]`;
            return jResponse;
        }

        if (jRequest.newPassword === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [newPassword]`;
            return jResponse;
        }
        if (jRequest.confirmPassword === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [confirmPassword]`;
            return jResponse;

        }
        if (jRequest.newPassword !== jRequest.confirmPassword) {
            jResponse.error_code = -2;
            jResponse.error_message = `The [newPassword] and [confirmPassword] field values are not same.`;
            return jResponse;
        }

        var sql = await dynamicSql.getSQL00(`select_TB_COR_USER_MST`, 2);
        var select_TB_COR_USER_MST_02 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId
            ]);

        if (select_TB_COR_USER_MST_02.rowCount === 1) {
            logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_USER_MST_02.rows[0])}\n`);
        }
        else if (select_TB_COR_USER_MST_02.rowCount <= 0) {
            jResponse.error_code = -1;
            jResponse.error_message = `${constants.messages.USER_ID_NOT_EXIST}`;
            return jResponse;
        }

        if (jRequest.authCode !== select_TB_COR_USER_MST_02.rows[0].auth_code) {
            jResponse.error_code = -2;
            jResponse.error_message = `The invalid user authorization code. please check email again.`;
            return jResponse;
        }

        logger.info(`OLD PASSWORD:${select_TB_COR_USER_MST_02.rows[0].password} NEW PASSWORD: ${jRequest.newPassword}\n`);

        const hashedCurrentPassword = select_TB_COR_USER_MST_02.rows[0].password;
        const isMatch = await bcrypt.compare(jRequest.newPassword, hashedCurrentPassword);
        if (isMatch) {
            jResponse.error_code = -1;
            jResponse.error_message = `The new password is same with current password.`;
            jResponse.rowCount = 0;
            return jResponse;
        }
        else {
            const hashedNewPassword = await bcrypt.hash(jRequest.newPassword, 10);
            var sql = await dynamicSql.getSQL00(`update_TB_COR_USER_MST`, 1);
            var update_TB_COR_USER_MST_01 = await database.executeSQL(sql,
                [
                    hashedNewPassword,
                    jRequest.systemCode,
                    jRequest.userId,
                    jRequest.phoneNumber,
                    hashedNewPassword
                ]);

            logger.info(`RESULT: rowCount=${update_TB_COR_USER_MST_01.rowCount}\n`);
            if (update_TB_COR_USER_MST_01.rowCount == 1) {
                jResponse.error_code = 0;
                jResponse.error_message = `${constants.messages.SUCCESS_CHANGED}`;
                logger.info(`RESULT:\n${JSON.stringify(jResponse)}\n`);
            } else {
                jResponse.error_code = -2;
                jResponse.error_message = `Failed to reset password. 
                Please check the phone number and authoriztion code.`;
            }
        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const deleteAccount = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.userId = jRequest.userId;

        if (jRequest.userId === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
            return jResponse;
        }
        if (jRequest.phoneNumber === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [phoneNumber]`;
            return jResponse;

        }

        if (jRequest.authCode === '') {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [authCode]`;
            return jResponse;
        }

        var sql = await dynamicSql.getSQL00(`select_TB_COR_USER_MST`, 2);
        var select_TB_COR_USER_MST_02 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId
            ]);

        if (select_TB_COR_USER_MST_02.rowCount === 1) {
            logger.info(`RESULT:\n${JSON.stringify(select_TB_COR_USER_MST_02.rows[0])}\n`);
        }
        else if (select_TB_COR_USER_MST_02.rowCount <= 0) {
            jResponse.error_code = -1;
            jResponse.error_message = `${constants.messages.USER_ID_NOT_EXIST}`;
            return jResponse;
        }

        if (jRequest.authCode !== select_TB_COR_USER_MST_02.rows[0].auth_code) {
            jResponse.error_code = -2;
            jResponse.error_message = `The invalid user authorization code. please check email again.`;
            return jResponse;
        }

        var sql = await dynamicSql.getSQL00(`update_TB_COR_USER_MST`, 3);
        var update_TB_COR_USER_MST_03 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId,
                jRequest.phoneNumber
            ]);

        logger.info(`RESULT: rowCount=${update_TB_COR_USER_MST_03.rowCount}\n`);
        if (update_TB_COR_USER_MST_03.rowCount == 1) {
            jResponse.error_code = 0;
            jResponse.error_message = `The user account successfully deleted.`;
            logger.info(`RESULT:\n${JSON.stringify(jResponse)}\n`);
        } else {
            jResponse.error_code = -2;
            jResponse.error_message = `Failed to delete account. 
            Please check the phone number and authoriztion code.`;
        }
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const sendEMailAuthCode = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.userId = jRequest.userId;

        if (jRequest.userId === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [userId]`;
            return jResponse;
        }
        if (jRequest.phoneNumber === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [phoneNumber]`;
            return jResponse;

        }
        if (jRequest.email === ``) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [email]`;
            return jResponse;

        }

        var sql = await dynamicSql.getSQL00(`select_TB_COR_USER_MST`, 3);
        var select_TB_COR_USER_MST_03 = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId
            ]);

        if (select_TB_COR_USER_MST_03.rowCount === 1) {
            // ID, 전화번호, 이메일주소가 맞늕지 확인 후
            if (select_TB_COR_USER_MST_03.rows[0].phone_number !== jRequest.phoneNumber ||
                select_TB_COR_USER_MST_03.rows[0].email_id !== jRequest.email) {

                // 사용자 정보 불일치 오류 - 사용자 전화번호와 이메일 주소 확인 메시지
                jResponse.error_code = -1;
                jResponse.error_message = `${constants.messages.PHONE_NUMBER_OR_EMAIL_NOT_VALID}`;

                return jResponse;
            }
            else {
                // 맞으면 인증코드 생성 후  
                var authCode = generateRandomString(6);
                // EMail로 전송하고    

                mailSender.sendEmail({
                    from: 'brunner-admin@brunner-next.com', // 발신자 이메일 주소
                    to: select_TB_COR_USER_MST_03.rows[0].email_id,  // 수신자 이메일 주소
                    subject: '[brunner-next]Your Authentication Code',
                    text: `Your user authentication code is: ${authCode}` // 이메일 본문
                })

                // 해당 인증코드를 DB에 저장
                var sql = await dynamicSql.getSQL00(`update_TB_COR_USER_MST`, 2);
                var update_TB_COR_USER_MST_02 = await database.executeSQL(sql,
                    [
                        authCode,
                        jRequest.systemCode,
                        jRequest.userId
                    ]);

                logger.info(`RESULT: rowCount=${update_TB_COR_USER_MST_02.rowCount}\n`);
                if (update_TB_COR_USER_MST_02.rowCount == 1) {
                    jResponse.error_code = 0;
                    jResponse.error_message = `The user authentication code has been sent to the registered email address. 
Please check the received email and enter the code.`;

                    logger.info(`RESULT:\n${JSON.stringify(jResponse)}\n`);
                } else {
                    jResponse.error_code = -2;
                    jResponse.error_message = `Failed to generate user authorization code. 
                    Please check your email or try again.`;
                }

            }
        }
        else if (select_TB_COR_USER_MST_03.rowCount <= 0) {
            jResponse.error_code = -1;
            jResponse.error_message = `The user Id not exist.`;
            return jResponse;
        }

    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const generateRandomString = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters[randomIndex];
    }

    return result;
};

const signout = (txnId, jRequest) => {
    var jResponse = {};

    try {
        jResponse.commanaName = jRequest.commandName;
        jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING;
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -3; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const verifyTelNo = (args) => {
    const msg = `invalid phone number.`;
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

export { executeService };