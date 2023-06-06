'use strict'

/*
 call backend server
*/
export default async function RequestServer(method, jRequest){
  const protocol= process.env.NEXT_PUBLIC_NODE_ENV === 'production' ?  `https`: `http`;
  const serverIp= process.env.NEXT_PUBLIC_NODE_ENV === 'production' ?  process.env.NEXT_PUBLIC_BACKEND_SERVER_IP_PROD: process.env.NEXT_PUBLIC_BACKEND_SERVER_IP_DEV;
  const serverPort= process.env.NEXT_PUBLIC_NODE_ENV === 'production' ?  process.env.NEXT_PUBLIC_BACKEND_SERVER_PORT_PROD: process.env.NEXT_PUBLIC_BACKEND_SERVER_PORT_DEV;

  if(method === 'GET'){
    return await RequestServerGet(protocol, serverIp, serverPort, jRequest);
  } else if (method === 'POST'){ 
    return await RequestServerPost(protocol, serverIp, serverPort, jRequest);
  }
}

async function RequestServerGet(protocol, serverIp, serverPort, strJsonRequest) {
  const res = await fetch(`${protocol}://${serverIp}:${serverPort}/executeJson/${strJsonRequest}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const jResponse = res.json();
  return jResponse;
}

async function RequestServerPost(protocol, serverIp, serverPort, strJsonRequest) {
  const res = await fetch(`${protocol}://${serverIp}:${serverPort}/executeJson/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: strJsonRequest
  });
  
  const jResponse = res.json();
  return jResponse;
}
