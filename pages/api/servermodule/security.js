
export default function executeService(jRequest){
    const commandName = jRequest.commandName;
    var jResponse = {};

    switch(commandName){
        case "security.login":
          jResponse = login(jRequest);
          break;
        case "security.logout":
          jResponse = logout(jRequest);
            break;
        case "security.createUser":
          jResponse = createUser(jRequest);
            break;
        case "security.deleteUser":
          jResponse = deleteUser(jRequest);
            break;
        default:
            break;
      }
      return jResponse;
}

const login = (jRequest) => {
    var jResponse = {};
    
    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;

    return jResponse;
};

const logout = (jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;
    
    return jResponse;
};

const createUser = (jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;
    
    return jResponse;
};

const deleteUser = (jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;
    
    return jResponse;
};
