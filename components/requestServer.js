'use strict'

export default async function requestServer(method, jRequest) {
  let res = null;
  let jResponse = null;
  const serverUrl = `/api/backendServer/`;

  try {
    res = await fetch(serverUrl, {
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
