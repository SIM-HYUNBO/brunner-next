// bot/MessageParser.js
class MessageParser {
    constructor(actionProvider, state) {
        this.actionProvider = actionProvider;
        this.state = state;
    }

    // Every message that the user sends is passed through the MessageParser's parse function. 
    parse(message) {
        const lowercase = message.toLowerCase();

        if (lowercase.includes('hello world')) {
            this.actionProvider.helloWorldHandler(message);
        }
        else if (lowercase.includes('hey')) {
            this.actionProvider.heyHandler(message);
        }
        else if (lowercase.includes('hi')) {
            this.actionProvider.hiHandler(message);
        }
        else {
            this.actionProvider.unknownMessageHandler(message);
        }
    }
}

export default MessageParser;