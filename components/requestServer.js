'use strict'
import * as constants from '@/components/constants'

export default async function RequestServer(jRequest, method = 'POST', serverUrl = `/api/backendServer/`) {
  let res = null;
  let jResponse = null;

  try {
    res = await fetch(serverUrl, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jRequest)
    });

    jResponse = res.json();
    return jResponse;
  }
  catch (e) {
    jResponse = {};
    jResponse.error_code = -1;
    jResponse.error_message = `${constants.messages.MESSAGE_SERVER_NOT_CONNECTTED} ${e}`;
    return jResponse;
  }
}
