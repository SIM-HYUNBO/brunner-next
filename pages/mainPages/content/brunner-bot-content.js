import BrunnerBotContentAnimation from './content-animation/brunner-bot-content-animation'
import { useRouter } from 'next/router'

export default function BrunnerBotContent() {
  const router = useRouter()

  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          Brunner Chat Bot
        </h1>
        <div className="main-governing-text">
          Chat Bot 화면입니다.
          재미있게 봇과 대화 해보세요.
        </div>
        <div className="flex justify-center">
          <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
            onClick={() => router.push('/mainPages/content/view/brunnerBotView')}>
            챗봇 시작하기
          </button>
        </div>
      </div>
      <div className="lg:h-2/6 lg:w-2/6">
        <BrunnerBotContentAnimation />
      </div>
    </>
  );
}