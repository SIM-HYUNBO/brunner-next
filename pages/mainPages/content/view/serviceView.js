import Layout from '../../../../components/layout'
import Head from 'next/head'
import BodySection from '../../../../components/body-section'

export default function ServiceView() {
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
        <section className="text-gray-600 body-font overflow-hidden">
          <div className="container px-5 py-5 mx-auto">
            <div className="flex flex-wrap -m-12">
              <div className="p-12 md:w-1/2 flex flex-col items-start">
                <span className="inline-block py-1 px-2 rounded bg-indigo-50 text-indigo-500 text-xs font-medium tracking-widest">CATEGORY</span>
                <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">플랫폼 구축 서비스</h2>
                <p className="leading-relaxed mb-8 h-auto">고객이 원하는 서비스 또는 시스템을 구축합니다.<br/> 
                시스템 구축에 필요한 권장 아키텍처 구성을 제안하고 충분한 협의를 거쳐 완성한 후 프로젝트를 착수합니다. 
                프로젝트를 수행하는 모든 과정은 고객 참여형으로 이루어집니다.<br/> 
                그 과정에서 고객은 필요한 의견을 제시할 수 있고 중간 결과물을 검토할 수 있습니다.<br/>
                최종 완성된 서비스는 운영팀으로 자연스럽게 인수인계 되며 향후 지속적인 운영지원을 받을 수 있습니다.</p>
                <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">
                  <a className="text-indigo-500 inline-flex items-center">Our Coworkers
                    <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </a>
                  <span className="text-gray-400 mr-3 inline-flex items-center ml-auto leading-none text-sm pr-3 py-1 border-r-2 border-gray-200">
                    <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </span>
                  <span className="text-gray-400 inline-flex items-center leading-none text-sm">
                    <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                    </svg>
                  </span>
                </div>
                <a className="inline-flex items-center">
                  {/* <img alt="blog" src="https://dummyimage.com/104x104" className="w-12 h-12 rounded-full flex-shrink-0 object-cover object-center"> */}
                  <span className="flex-grow flex flex-col pl-4">
                    <span className="title-font font-medium text-gray-900">Joseph J.</span>
                    <span className="text-gray-400 text-xs tracking-widest mt-0.5">Chief Project Manager</span>
                  </span>
                </a>
              </div>
              <div className="p-12 md:w-1/2 flex flex-col items-start">
                <span className="inline-block py-1 px-2 rounded bg-indigo-50 text-indigo-500 text-xs font-medium tracking-widest">CATEGORY</span>
                <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">플랫폼 운영 서비스</h2>
                <p className="leading-relaxed mb-8">고객의 서비스를 운영합니다. <br/>
                Brunner의 플랫폼 운영팀은 플랫폼 구축팀과 밀접하게 협업합니다. <br/>
                운영팀은 콜센터와도 유기적으로 연결되어 있어 365일, 24시간 연중 무휴 고품질의 기술지원 서비스를 받을 수 있습니다.</p>
                <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">
                  <a className="text-indigo-500 inline-flex items-center">Our Coworkers
                    <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </a>
                  <span className="text-gray-400 mr-3 inline-flex items-center ml-auto leading-none text-sm pr-3 py-1 border-r-2 border-gray-200">
                    <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </span>
                  <span className="text-gray-400 inline-flex items-center leading-none text-sm">
                    <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                    </svg>
                  </span>
                </div>
                <a className="inline-flex items-center">
                  {/* <img alt="blog" src="https://dummyimage.com/103x103" className="w-12 h-12 rounded-full flex-shrink-0 object-cover object-center"> */}
                  <span className="flex-grow flex flex-col pl-4">
                    <span className="title-font font-medium text-gray-900">Fred S.</span>
                    <span className="text-gray-400 text-xs tracking-widest mt-0.5">Chief Operating Leader</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
        </div>
      </BodySection>
    </Layout>
  )
}
