import figlet from 'figlet';
import express from 'express';
import cors from 'cors';

// server's modules
import security from './servermodule/security'
import commonCode from './servermodule/commoncode'
import program from './servermodule/program'

const serverPort = 8080;
const server = express();
server.use(cors());

server.listen(serverPort, ()=>{
    console.log(`Brunner Server is started on the port [${serverPort}]..........`)
});

// get 요청을 받을 경우 (/executeJson/:requestJson)
server.get('/executeJson/:requestJson', (req, res)=>{
  var jRequest = JSON.parse(req.params.requestJson);
  var remoteIp= req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
  jRequest.__REMOTE_CLIENT_IP = remoteIp;
  var jResponse = executeService(jRequest);
  res.send(`${JSON.stringify(jResponse)}`);    
}
)

function executeService(jRequest){
  var jResponse = {};
  console.log(`request: ${JSON.stringify(jRequest)}`);
 
  const commandName = jRequest.commandName;

  if(commandName.startsWith('security.')){
    jResponse = security(jRequest);
  } else if(commandName.startsWith('program.')){
    jResponse = program(jRequest);  
  } else if(commandName.startsWith('commonCode.')){
    jResponse = commonCode(jRequest);
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