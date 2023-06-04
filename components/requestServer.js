'use strict'

async function RequestServerGet(serverIp, serverPort, strJsonRequest) {
  const res = await fetch(`http://${serverIp}:${serverPort}/executeJson/${strJsonRequest}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const jResponse = res.json();
  return jResponse;
}

async function RequestServerPost(serverIp, serverPort, strJsonRequest) {
  const res = await fetch(`http://${serverIp}:${serverPort}/executeJson/`, {
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
  const serverIp= process.env.BACKEND_SERVER_IP;
  const serverPort=process.env.BACKEND_SERVER_PORT;

  if(method === 'GET'){
    return await RequestServerGet(serverIp, serverPort, jRequest);
  } else if (method === 'POST'){cd 
    return await RequestServerPost(serverIp, serverPort, jRequest);
  }
}