import ServiceIntroAnimation from './service-intro-animation'

export default function ServiceIntro(){
    return (
        <>
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-green-900">
              최고를 바라봅니다. <br></br>
              <br className="hidden lg:inline-block"/>
            </h1>
            <pre className="mb-8 leading-relaxed text-white-900">
              어떤 서비스를 구축하고 싶으십니까? <br/>
              Brunner의 플랫폼은 최고의 기술력과 풍부한 경험의 집약체입니다. <br/>
              빠른 구축과 함께 안정적인 서비스 운영까지도 책임집니다. <br/>
              바로 시작하십시요.
            </pre>
            <div className="flex justify-center">
            <button onClick={() => router.push('/serviceView')} className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
                서비스 보기
            </button>
            </div>
          </div>
          <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
            <ServiceIntroAnimation/>
          </div>
        </>
    );
}