

export function login(jRequest){
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;

    return jResponse;
}

export function logout(jRequest){
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;
    
    return jResponse;
}
export function createUser(jRequest){
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;
    
    return jResponse;
}
export function deleteUser(jRequest){
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.__REMOTE_CLIENT_IP = jRequest.__REMOTE_CLIENT_IP;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;
    
    return jResponse;
}
