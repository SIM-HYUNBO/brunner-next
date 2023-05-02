
export default function executeService(jRequest){
    const commandName = jRequest.commandName;
    var jResponse = {};

    switch(commandName){
        case "commoncode.createCommonCode":
          jResponse = createCommonCode(jRequest);
          break;
        default:
            break;
      }
      return jResponse;  
}

const createCommonCode = (jRequest) => {
    var jResponse = {};
    
    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;

    return jResponse;
}
