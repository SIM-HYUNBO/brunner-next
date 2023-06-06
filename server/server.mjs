`use strict`

import fs from 'fs'
import express from 'express'
import https from 'https';

import session from 'express-session'
import cors from  'cors'
import next from 'next'
import rateLimit from 'express-rate-limit'

// // server's modules.
import security from './components/security.mjs'

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log(`NODE_ENV:${process.env.NODE_ENV}`);

  const server = express();
  server.use(express.json())

  server.use(cors({
    origin:'*',
    methods: ['GET', 'POST'],
    credentials:true,
  }));
  server.use(session({
    secret: '1@%24^%$3^*&98&^%$',   // 쿠키에 저장할 connect.sid값을 암호화할 키값 입력
    resave: false,                  //세션 아이디를 접속할때마다 새롭게 발급하지 않음
    saveUninitialized: true,        //세션 아이디를 실제 사용하기전에는 발급하지 않음
    cookie: { secure: true }
  }));

  // throttling
  const limiter = rateLimit({
    windowMs: 1 * 1 * 60 * 1000, // 24 hrs in milliseconds
    max: 100,
    message: 'You have exceeded the 100 requests in 1 min. limit!', 
    standardHeaders: true,
    legacyHeaders: false,
  });

  server.use(limiter);
  // server.set('trust proxy', 1);
 
  const serverIp= dev ? process.env.BACKEND_SERVER_IP_DEV: process.env.BACKEND_SERVER_IP_PROD;
  const serverPort= dev ? process.env.BACKEND_SERVER_PORT_DEV: process.env.BACKEND_SERVER_PORT_PROD;

  if(dev) {
    server.listen(serverPort, serverIp, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${serverIp}:${serverPort}`);
    });
  }
  else {
    var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
    var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
    var credentials = {key: privateKey, cert: certificate};
    var httpsServer = https.createServer(credentials, app);
    
    httpsServer.listen(serverPort, serverIp, (err) => {
      if (err) throw err;
      console.log(`> Ready on https://${serverIp}:${serverPort}`);
    }); 
  }

  server.get('/executeJson', async(req, res) => {
    var jResponse=null;
    jResponse = await executeService("GET", req);
    res.send(`${JSON.stringify(jResponse)}`);    
  });

  server.post('/executeJson', async(req, res) => {
    var jResponse=null;
    jResponse = await executeService("POST", req);
    res.send(`${JSON.stringify(jResponse)}`);    
  });
 
  server.get('*/*', (req, res) => {
    return handle(req, res);
  });  
});

const executeService = async(method, req)=>{
    var jRequest = method==="GET"? JSON.parse(req.params.requestJson): method==="POST"? req.body: null;
    var jResponse = null;
    const commandName = jRequest.commandName;
    var remoteIp= req.headers['x-forwarded-for'] || req.socket.remoteAddress ;
    console.log(`${method} request: ${JSON.stringify(jRequest)} from ${remoteIp}`);
   
    if(commandName.startsWith('security.')){
      jResponse = await security(req, jRequest);
    } 
    console.log(`reply: ${JSON.stringify(jResponse)}`);
    return jResponse;
  }