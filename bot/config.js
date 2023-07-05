// bot/config.js
import { createChatBotMessage } from "react-chatbot-kit";
import LearningOptions from "./LearningOptions";
const config = {
    botName: "Brunner Learning Bot",
    initialMessages: [
        createChatBotMessage(
            "Hello! Do you have a question?"
        ),
    ],
    customStyles: {
        botMessageBox: {
            backgroundColor: '#376B7E',
        },
        chatButton: {
            backgroundColor: '#5ccc9d',
        },
        chatInput: {
            backgroundColor: '#5ccc9d',
        },
    },
    widgets: [
        {
            widgetName: "learningOptions",
            widgetFunc: (props) => <LearningOptions {...props} />,
        },
        {
            widgetName: "javascriptLinks",
            widgetFunc: (props) => <LinkList {...props} />,
        },
    ],
};

export default config;