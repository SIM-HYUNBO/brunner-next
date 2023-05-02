
export default function executeService(jRequest){
    const commandName = jRequest.commandName;
    var jResponse = {};

    switch(commandName){
        case "commoncode.createProgram":
          jResponse = createProgram(jRequest);
          break;
        default:
            break;
      }
      return jResponse;  
}

const createProgram = (jRequest) => {
    var jResponse = {};
    
    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;

    return jResponse;
}
