import Layout from '../../../../components/layout'
import Head from 'next/head'
import BodySection from '../../../../components/body-section'

import Chatbot from "react-chatbot-kit";
import config from "./../../../../bot/config.js";
import MessageParser from "./../../../../bot/MessageParser.js";
import ActionProvider from "./../../../../bot/ActionProvider.js";
import "react-chatbot-kit/build/main.css";

export default function BrunnerBotView() {
  return (
    <Layout>
      <Head>
        <title>Brunner Home</title>
        <meta name="description" content="서비스플랫폼"></meta>
        <meta rel="icon" href="brunnerLogo.png"></meta>
        <link></link>
      </Head>
      <BodySection>
        <div className="container mx-auto flex px-5 py-20 md:flex-row flex-col items-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
            Brunner Chat Bot
          </h1>
        </div>
        <div className="flex justify-center">
          <section className="text-gray-600 body-font overflow-hidden">
            <Chatbot
              config={config}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
            />
          </section>
        </div>
      </BodySection>
    </Layout>
  )
}
