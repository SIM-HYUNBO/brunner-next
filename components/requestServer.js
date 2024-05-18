'use strict'

export default async function RequestServer(method, jRequest) {
  let res = null;
  let jResponse = null;
  const backendServerUrl = `/api/backendServer/`;

  try {
    res = await fetch(backendServerUrl, {
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
