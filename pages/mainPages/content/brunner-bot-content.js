import BrunnerBotContentAnimation from './content-animation/brunner-bot-content-animation'
import { useRouter } from 'next/router'
import Chatbot from "react-chatbot-kit";
import config from "./../../../bot/config";
import MessageParser from "./../../../bot/MessageParser.js";
import ActionProvider from "./../../../bot/ActionProvider.js";

export default function BrunnerBotContent() {
  const router = useRouter()

  return (
    <>
      <div className="lg:flex-grow md:w-full lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
        <h2 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          Brunner Bot
        </h2>
        <div className="main-governing-text">
          재미있게 봇과 대화 해보세요.
        </div>
        <div className="flex justify-center w-full">
          <div className="flex justify-center w-full">
            <section className="text-gray-600 body-font overflow-hidden w-full">
              <Chatbot
                config={config}
                messageParser={MessageParser}
                actionProvider={ActionProvider}
              />
            </section>
          </div>
        </div>
      </div>
      <div className="lg:h-2/6 lg:w-2/6">
        <BrunnerBotContentAnimation />
      </div>
    </>
  );
}