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
server.get('/executeJson/:requestJson', async (req, res)=>{
  var jRequest = JSON.parse(req.params.requestJson);
  var jResponse = {};
  var remoteIp= req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;

  console.log(`request: ${JSON.stringify(jRequest)} from ${remoteIp}`);
 
  const commandName = jRequest.commandName;

  if(commandName.startsWith('security.')){
    jResponse = await security(jRequest);
  } else if(commandName.startsWith('program.')){
    jResponse = await program(jRequest);  
  } else if(commandName.startsWith('commonCode.')){
    jResponse = await commonCode(jRequest);
  }  

  console.log(`reply: ${JSON.stringify(jResponse)}`);
  res.send(`${JSON.stringify(jResponse)}`);    
})

// Brunner 글자 로고 표시
figlet("Brunner", (err, data)=>{
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
});