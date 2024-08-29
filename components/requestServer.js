'use strict'
import * as Constants from '@/components/constants'

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
    jResponse.error_message = `${Constants.MESSAGE_SERVER_NOT_CONNECTTED} ${e}`;
    return jResponse;
  }
}
