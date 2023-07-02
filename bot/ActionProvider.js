// bot/ActionProvider.js
class ActionProvider {
    constructor(createChatbotMessage, setStateFunc, createClientMessage) {
        this.createChatbotMessage = createChatbotMessage;
        this.setState = setStateFunc;
        this.createClientMessage = createClientMessage;
    }

    setChatbotMessage = (message) => {
        this.setState(state => ({ ...state, messages: [...state.messages, message] }))
    }

    hiHandler = (message) => {
        const reply = this.createChatbotMessage(`Hi, It's a nice day!`);
        this.setChatbotMessage(reply);
    }

    heyHandler = (message) => {
        const reply = this.createChatbotMessage(`Hi, It's a nice day! Did you call me?`);
        this.setChatbotMessage(reply);
    }

    helloWorldHandler = (message) => {
        const reply = this.createChatbotMessage(`Hello, I'm not self aware. Luckily!`);
        this.setChatbotMessage(reply);
    }

    unknownMessageHandler = (message) => {
        const reply = this.createChatbotMessage(`Ooooops, ${message}???. I have no idea for that. I'am learning more and more....`);
        this.setChatbotMessage(reply);
    }
}

export default ActionProvider;