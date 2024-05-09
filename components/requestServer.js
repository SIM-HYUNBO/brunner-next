'use strict'

/*
 call backend server
*/
export default async function RequestServer(method, jRequest) {
  const protocol = process.env.NEXT_PUBLIC_BACKEND_SERVER_PROTOCOL;
  const serverIp = process.env.NEXT_PUBLIC_BACKEND_SERVER_IP;
  const serverPort = process.env.NEXT_PUBLIC_BACKEND_SERVER_PORT;

  let res = null;
  let jResponse = null;

  try {
    // res = await fetch(`${protocol}://${serverIp}:${serverPort}/executeJson/`, {
    res = await fetch(`${protocol}://${serverIp}:${serverPort}/api/service/`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: jRequest
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
