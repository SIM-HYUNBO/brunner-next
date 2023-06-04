`use strict`

import express from 'express';
import https from 'https';
import session from 'express-session';
import cors from  'cors';
import next from 'next';
import fs from 'fs';

// // server's modules.
import security from './components/security.mjs'

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const key = fs.readFileSync('server/key.pem', 'utf8');
  const cert = fs.readFileSync('server/cert.pem', 'utf8');
  const credentials = {
    key: key,
    cert: cert
  };
  server.use(cors());
  const httpsServer = https.createServer(credentials, server);
  httpsServer.listen(3000, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on https://0.0.0.0:3000`);
  });

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

//   const limiter = rateLimit({
//     windowMs: 10 * 1000, // 15 minutes
//     max: 3, // limit each IP to 100 requests per windowMs
//   });

//   server.use(limiter);
//   server.set('trust proxy', 1);

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