'use strict'

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

  const serverIp= '112.156.201.62' //process.env.REMOTE_SERVER_IP; 
  const serverPort=8443 //process.env.REMOTE_SERVER_PORT; 

  if(method === 'GET'){
    return await RequestServerGet(serverIp, serverPort, jRequest);
  } else if (method === 'POST'){
    return await RequestServerPost(serverIp, serverPort, jRequest);
  }
}