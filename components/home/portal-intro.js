import PortalIntroAnimation from './portal-intro-animation'

export default function PortalIntro(){
    return (
        <>
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-green-900">
              모두가 함께합니다. <br></br>
              <br className="hidden lg:inline-block"/>
            </h1>
            <pre className="mb-8 leading-relaxed text-white-900">
              자유롭게 협업하는 문화는 Brunner의 최고의 자산입니다. <br/>
              모든 구성원이 하나가 되어 함께 연구하는 문화는 모두가 부러워합니다. <br/>
              서로 존중하는 관계속에서 우리 스스로 가치를 찾아 냅니다. <br/>
            </pre>
            <div className="flex justify-center">
              <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
                포탈 구경하기</button>
            </div>
          </div>
          <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
            <PortalIntroAnimation/>
          </div>
        </>
    );
}