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


    chatGPTHandler = async (message) => {
        const newMessages = [message];
        const reply = await this.processMessageToChatGPT(newMessages);

        if (reply)
            this.setChatbotMessage(reply);
    }

    processMessageToChatGPT = async (chatMessages) => {
        // chatMessages { sender: "user" or "ChatGPT", message: "The message content here" }
        // apiMessages {roles:"user" or "assistant", content:"The message content here"}
        let apiMessages = chatMessages.map((messageObject) => {
            let role = "";
            if (messageObject.sender === "ChatGPT") {
                role = "assistant"
            } else {
                role = "user"
            }
            return { role: role, content: messageObject.message }
        });

        // role: "user" -> a message from the user, "assistant" -> a response from chatGPT
        // "system" -> genrally one initial message defining HOW we want chatgpt to talk

        const systemMessage = {
            role: "system",
            conent: "Explain all concepts like I am 10 years old."
        }

        const apiRequestBody = {
            "model": "gpt-3.5-turbo",
            "messages": {
                systemMessage,
                ...apiMessages // [message1, message2, message3]
            }
        }

        await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('openAPIKey'),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(apiRequestBody)
        }).then((data) => {
            return data.json();
        }).then((data) => {
            alert(JSON.stringify(data.error, null, 4));
            return undefined;
        })
    }


}

export default ActionProvider;