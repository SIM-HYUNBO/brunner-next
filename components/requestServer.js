'use strict'

/*
 call backend server
*/
export default async function RequestServer(method, jRequest) {
  let res = null;
  let jResponse = null;

  try {
    res = await fetch(`/api/service/`, {
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
