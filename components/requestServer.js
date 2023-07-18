'use strict'

/*
 call backend server
*/
export default async function RequestServer(method, jRequest) {
  const protocol = process.env.NEXT_PUBLIC_BACKEND_SERVER_PROTOCOL;
  const serverIp = process.env.NEXT_PUBLIC_BACKEND_SERVER_IP;
  const serverPort = process.env.NEXT_PUBLIC_BACKEND_SERVER_PORT;

  if (method === 'GET') {
    return await RequestServerGet(protocol, serverIp, serverPort, jRequest);
  } else if (method === 'POST') {
    return await RequestServerPost(protocol, serverIp, serverPort, jRequest);
  }
}

async function RequestServerGet(protocol, serverIp, serverPort, strJsonRequest) {
  let res = null;
  let jResponse = null

  try {
    res = await fetch(`${protocol}://${serverIp}:${serverPort}/executeJson/${strJsonRequest}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    jResponse = res.json();
    return jResponse;
  }
  catch (e) {
    jResponse = {};
    jResponse.error_code = -1;
    jResponse.error_message = `cannot connect to seerver. ${e}`;
    return jResponse;

  }
}

async function RequestServerPost(protocol, serverIp, serverPort, strJsonRequest) {
  let res = null;
  let jResponse = null;

  try {
    res = await fetch(`${protocol}://${serverIp}:${serverPort}/executeJson/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: strJsonRequest
    });

    jResponse = res.json();
    return jResponse;
  }
  catch (e) {
    jResponse = {};
    jResponse.error_code = -1;
    jResponse.error_message = `cannot connect to seerver. ${e}`;
    return jResponse;
  }
}
