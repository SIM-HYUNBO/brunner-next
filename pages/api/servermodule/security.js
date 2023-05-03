
import {connect, execSql, close} from '../database'
import * as TB_COR_USER_MST from '../sqls/TB_COR_USER_MST';

export default function executeService(jRequest){
  var jResponse = {};
  var connection = null;

  try {
    connection = connect();

    switch(jRequest.commandName){
        case "security.login":
          jResponse = login(connection, jRequest);
          break;
        case "security.logout":
          jResponse = logout(connection, jRequest);
            break;
        case "security.createUser":
          jResponse = createUser(connection, jRequest);
            break;
        case "security.deleteUser":
          jResponse = deleteUser(connection, jRequest);
            break;
        default:
            break;
      }    
  } catch (error) {
    console.log(error);
  } finally {
    if(connection) 
      close(connection);

    return jResponse;
  }
}

const login = async (connection, jRequest) => {
    var jResponse = {};
    
    jResponse.commanaName = jRequest.commandName;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;

    var sql = TB_COR_USER_MST.select_DB_COR_USER_MST_01;
    var params=[jRequest.userId];
    
    await execSql(connection, sql, params).then((rows) => {
      jResponse.results = rows;
     }).catch((e)=>{
      console.log(e);
    }).finally(() => {
      // console.log(jResponse);
    });

     return jResponse;
};

const logout = (connection, jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;
    
    return jResponse;
};

const createUser = (connection, jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;
    
    return jResponse;
};

const deleteUser = (connection, jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;
    
    return jResponse;
};
