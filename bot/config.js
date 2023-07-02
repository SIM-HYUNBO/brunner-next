// bot/config.js
import { createChatBotMessage } from "react-chatbot-kit";
import LearningOptions from "./LearningOptions";
const config = {
    initialMessages: [
        createChatBotMessage(
            "안녕하세요! 궁금한 내용을 입력해주세요."
        ),
    ],
    customStyles: {
        botMessageBox: {
            backgroundColor: '#376B7E',
        },
        chatButton: {
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