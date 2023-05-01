import figlet from 'figlet';
import express from 'express';
import cors from 'cors';

// 서버 각 모듈별로 기능 분리하여 개발
import {login,logout,createUser,deleteUser} from './servermodule/security'



const serverPort = 8080;
const server = express();
server.use(cors());

server.listen(serverPort, ()=>{
    console.log(`Brunner Server is started on the port [${serverPort}]..........`)
});

// get 요청을 받을 경우 (/executeJson/:requestJson)
server.get('/executeJson/:requestJson', (req, res)=>{
  var jRequest = JSON.parse(req.params.requestJson);
  // var commandName = jRequest.commandName;
  var remoteIp= req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
  jRequest.__REMOTE_CLIENT_IP = remoteIp;
  
  // console.log(req.params);
  // console.log(`${commandName} from ip ${remoteIp}` );

  var jResponse = executeService(jRequest);
  // console.log(`"response-data:" ${JSON.stringify(jResponse)}`);

  res.send(`${JSON.stringify(jResponse)}`);    
}
)

function executeService(jRequest){
  var jResponse = {};
  console.log(`request: ${JSON.stringify(jRequest)}`);
 
  const commandName = jRequest.commandName;

  jResponse.commandName = commandName;

  if(commandName.startsWith('security.')){
    switch(commandName){
      case "security.login":
        jResponse = login(jRequest);
        break;
      case "security.logout":
        jResponse = logout(jRequest);
          break;
      case "security.createUser":
        jResponse = createUser(jRequest);
          break;
      case "security.deleteUser":
        jResponse = deleteUser(jRequest);
          break;
      default:
          break;
    }
  } else if(commandName.startsWith('program.')){
  
  } else if(commandName.startsWith('commonCode.')){
  
  }  

  console.log(`reply: ${JSON.stringify(jResponse)}`);
  return jResponse;
}

// Brunner 글자 로고 표시
figlet("Brunner", (err, data)=>{
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
});