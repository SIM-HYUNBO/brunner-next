'use strict'

/*
 call backend server
*/
export default async function RequestServer(method, jRequest){
  const serverIp= process.env.NEXT_PUBLIC_NODE_ENV === 'production' ?  process.env.NEXT_PUBLIC_BACKEND_SERVER_IP_PROD: process.env.NEXT_PUBLIC_BACKEND_SERVER_IP_DEV;
  const serverPort= process.env.NEXT_PUBLIC_NODE_ENV === 'production' ?  process.env.NEXT_PUBLIC_BACKEND_SERVER_PORT_PROD: process.env.NEXT_PUBLIC_BACKEND_SERVER_PORT_DEV;

  if(method === 'GET'){
    return await RequestServerGet(serverIp, serverPort, jRequest);
  } else if (method === 'POST'){ 
    return await RequestServerPost(serverIp, serverPort, jRequest);
  }
}

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
