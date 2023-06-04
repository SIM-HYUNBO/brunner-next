'use strict'
import dotenv from 'dotenv';

async function RequestServerGet(serverIp, serverPort, strJsonRequest) {
  const res = await fetch(`https://${serverIp}:${serverPort}/executeJson/${strJsonRequest}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const jResponse = res.json();
  return jResponse;
}

async function RequestServerPost(serverIp, serverPort, strJsonRequest) {
  const res = await fetch(`https://${serverIp}:${serverPort}/executeJson/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: strJsonRequest
  });
  
  const jResponse = res.json();
  return jResponse;
}

export default async function RequestServer(method, jRequest){
  dotenv.config();

  const serverIp= 'brunner-client-next.vercel.app'
  const serverPort=3000 // process.env.BACKEND_SERVER_PORT;

  if(method === 'GET'){
    return await RequestServerGet(serverIp, serverPort, jRequest);
  } else if (method === 'POST'){ 
    return await RequestServerPost(serverIp, serverPort, jRequest);
  }
}