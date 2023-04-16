import IntroAnimation from './intro-animation'

export default function Intro(){
    return (
        <>
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-green-900">
              항상 연구합니다. <br></br>
              <br className="hidden lg:inline-block"/>
            </h1>
            <pre className="mb-8 leading-relaxed text-white-900">
              시스템 구축을 원하십니까? <br/>
              언제든 고객이 원하는 플랫폼을 빠르게 구축하고 사용해 볼 수 있습니다. <br/>
              최신의 기술을 보유하고 있는 최고의 기술진들이 항상 준비하고 있습니다. <br/>
              바로 시작하십시요.
            </pre>
            <div className="flex justify-center">
            <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
                둘러보기
            </button>
            </div>
          </div>
          <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
            <IntroAnimation/>
          </div>
        </>
    );
}