`use strict`

import * as database from './database/database.mjs'
import * as TB_COR_USER_MST from './database/sqls/TB_COR_USER_MST.mjs'

export default function executeService(req, jRequest){
  var jResponse = {};
  try {
    switch(jRequest.commandName){
      case "security.signup":
        jResponse = signup(req, jRequest);
          break;
      case "security.signin":
          jResponse = signin(req, jRequest);
          break;
        case "security.signout":
          jResponse = signout(req, jRequest);
            break;
        case "security.resetPassword":
          jResponse = resetPassword(req, jRequest);
            break;
        default:
            break;
      }    
  } catch (error) {
    console.log(error);
  } finally {
    return jResponse;
  }
}

const signup = async (req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId=jRequest.userId;
  jResponse.password=jRequest.password;

  console.log(`session 사용자 정보 확인. ${JSON.stringify(req.session.userInfo)}`);

  if(req.session.userInfo && req.session.userInfo.userId){
    console.log(`session에 이미 사용자 로그인 정보가 있음. ${JSON.stringify(req.session.userInfo)}`);
    jResponse.userInfo = req.session.userInfo;

    jResponse.error_code = -1; // already a user signined
    jResponse.error_message = `already a user signined`;

    return jResponse;
  } else {
    if(jRequest.userId == undefined || jRequest.userId.trim() == ``) {
      jResponse.error_code = -2; 
      jResponse.error_message = `[userId] is missing.`;
      return jResponse;
    }
    if(jRequest.userId.length < 5 || jRequest.userId.length > 10) {
      jResponse.error_code = -2; 
      jResponse.error_message = `[userId] length should be from 5 to 10.`;
      return jResponse;
    }
    if(jRequest.password == undefined || jRequest.password.trim() == ``) {
      jResponse.error_code = -2; 
      jResponse.error_message = `[password] is missing.`;
      return jResponse;
    }
    if(jRequest.password.length < 5 || jRequest.password.length > 10) {
      jResponse.error_code = -2; 
      jResponse.error_message = `[password] length should be from 5 to 10.`;
      return jResponse;
    }
    if(jRequest.userName == undefined || jRequest.userName.trim() == ``) {
      jResponse.error_code = -2; 
      jResponse.error_message = `[userName] is missing.`;
      return jResponse;
    }
    if(jRequest.userName.length < 2 || jRequest.userName.length > 10) {
      jResponse.error_code = -2; 
      jResponse.error_message = `[password] length should be from 2 to 10.`;
      return jResponse;
    }
    if(jRequest.phoneNumber == undefined || jRequest.phoneNumber.trim() == ``) {
      jResponse.error_code = -2; 
      jResponse.error_message = `[phoneNumber] is missing.`;
      return jResponse;
    }
    if(validTelNo(jRequest.phoneNumber) == false){
      jResponse.error_code = -2; 
      jResponse.error_message = `[phoneNumber] is not valid.`;
      return jResponse;      
    }
    if(jRequest.email == undefined || jRequest.email.trim() == ``) {
      jResponse.error_code = -2; 
      jResponse.error_message = `[email] is missing.`;
      return jResponse;
    }
    if(validEMail(jRequest.email) == false){
      jResponse.error_code = -2; 
      jResponse.error_message = `[email] is not valid.`;
      return jResponse;
    }
    if(jRequest.registerNo == undefined || jRequest.registerNo.trim() == ``) {
      jResponse.error_code = -2; // incorrect user info 
      jResponse.error_message = `[registerNo] is missing.`;
      return jResponse;
    }
    if(jRequest.address == undefined || jRequest.address.trim() == ``) {
      jResponse.error_code = -2; // incorrect user info 
      jResponse.error_message = `[address] is missing.`;
      return jResponse;
    }
    if(jRequest.registerName == undefined || jRequest.registerName.trim() == ``) {
      jResponse.error_code = -2; // incorrect user info 
      jResponse.error_message = `[registerName] is missing.`;
      return jResponse;
    }

    await database.querySQL(
      TB_COR_USER_MST.select_DB_COR_USER_MST_01, 
      [
        jRequest.userId
      ]).then((result) => {
        console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
        
        if(result[0].length > 0) {
          jResponse.error_code = -1;
          jResponse.error_message = `The user Id is already occupied.`;
          return jResponse;
         }
        else {
          jResponse.error_code = 0;
          jResponse.error_message = ``;
        } 
      }).catch((e)=>{
        jResponse.error_code = -3; // exception
        jResponse.error_message = e;
      }).finally(() => {
        // console.log(jResponse);
      });

      if(jResponse.error_code < 0){
        return jResponse;
      }

      await database.executeSQL(TB_COR_USER_MST.insert_DB_COR_USER_MST_01, 
                    [
                      process.env.DEFAULT_SYSTEM_CODE,
                      jRequest.userId,
                      jRequest.password,
                      jRequest.userName,
                      process.env.NORMAL_AUTHORITY_GROUP,
                      jRequest.address,
                      jRequest.phoneNumber,
                      jRequest.email,
                      jRequest.registerNo,
                      jRequest.registerName,
                      jRequest.salesType,
                      jRequest.salesCategory,
                      'Y',
                      process.env.SYSTEM_USER_ID
                    ]).then((result) => {
          console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
          if(result[0].affectedRows == 1) {
            jResponse.error_code = 0;
            jResponse.error_message = `ok`;
            }
          else {
            jResponse.error_code = -3; 
            jResponse.error_message = `database failed.`;
          } 
      }).catch((e)=>{
        jResponse.error_code = -3; // exception
        jResponse.error_message = e;
      }).finally(() => {
          // console.log(jResponse);
      });
  }    

  return jResponse;
};

const signin = async (req, jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;

    console.log(`session info ${JSON.stringify(req.session)}`);

    if(req.session && req.session.userInfo){
      console.log(`session에 이미 로그인 정보가 있음. ${JSON.stringify(req.session.userInfo)}`);
      jResponse.userInfo = req.session.userInfo;
    } else {
      console.log(`session에 로그인 정보가 없음.`);

      await database.querySQL(TB_COR_USER_MST.select_DB_COR_USER_MST_01, 
                    [
                      jRequest.userId
                    ]).then((result) => {
          console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
          if(result[0].length == 1) {
            // console.log(`${result[0].PASSWORD},${jRequest.password}`)
            if( result[0][0].PASSWORD === jRequest.password) {
              jResponse.error_code = 0;
              jResponse.error_message = `ok`;
              jResponse.userInfo = result[0][0];
              jResponse.userInfo.password='*';
              req.session.userInfo = jResponse.userInfo;
              req.session.save(()=> {
                console.log(`session에 사용자 정보 설정함.`);
                console.log(`session info ${JSON.stringify(req.session)}`);
              });
            } else {
              jResponse.error_code = -1; // incorrect password 
              jResponse.error_message = `incorrect password`;
            }
          } else {
            jResponse.error_code = -2; // incorrect user info 
            jResponse.error_message = `incorrect user info`;
          } 
      }).catch((e)=>{
        jResponse.error_code = -3; // exception
        jResponse.error_message = e;
      }).finally(() => {
          // console.log(jResponse);
      });
    }    

    return jResponse;
};

const resetPassword = async (req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId=jRequest.userId;

  if(jRequest.userId === ''){
      jResponse.error_code = -2;
      jResponse.error_message = `the userId field value is missing.`;
      return jResponse;
  }
  if(jRequest.registerNo === ''){
      jResponse.error_code = -2;
      jResponse.error_message = `the registerNo field value is missing.`;
      return jResponse;
  }
  if(jRequest.phoneNumber === ''){
      jResponse.error_code = -2;
      jResponse.error_message = `the phoneNumber field value is missing.`;
      return jResponse;

  }
  if(jRequest.newPassword === ''){
      jResponse.error_code = -2;
      jResponse.error_message = `the newPassword field value is missing.`;
      return jResponse;
  }
  if(jRequest.confirmPassword === ''){
      jResponse.error_code = -2;
      jResponse.error_message = `the confirmPassword field value is missing.`;
      return jResponse;

  }
  if(jRequest.newPassword !== jRequest.confirmPassword){
    jResponse.error_code = -2;
    jResponse.error_message = `the newPassword and confirmPassword fields value are not same.`;
    return jResponse;
  }

  await database.executeSQL(TB_COR_USER_MST.update_DB_COR_USER_MST_01, 
                [
                  jRequest.newPassword, 
                  jRequest.userId, 
                  jRequest.registerNo, 
                  jRequest.phoneNumber, 
                  jRequest.newPassword
                ]).then((result) => {
    console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);

    if(result[0].affectedRows == 1) {
      jResponse = result[0];
    } else {
      jResponse.error_code = -2;
      jResponse.error_message = `database error occured.`;
    } 
  }).catch((e)=>{
    console.log(`${e}`);
    jResponse.error_code = -3; // exception
    jResponse.error_message = e;
  }).finally(() => {
      // console.log(jResponse);
  });

  return jResponse;
};

const signout = (req, jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;

    jResponse.error_code = 0;
    jResponse.error_message = `ok`;
    req.session.userInfo = {};
    req.session.save(()=> {
      console.log(`session에 사용자 정보 삭제함.`);
      console.log(`session info ${JSON.stringify(req.session)}`);
    });    
    
    return jResponse;
};

const validTelNo = (args)=>{
  const msg = '유효하지 않는 전화번호입니다.';
  // IE 브라우저에서는 당연히 var msg로 변경
  
  if (/^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/.test(args)) {
      return true;
  }
  // alert(msg);
  return false;
}

const validEMail = (email)=>{
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}