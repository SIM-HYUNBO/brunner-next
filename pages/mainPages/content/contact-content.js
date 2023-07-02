import ContactContentAnimation from './content-animation/contact-content-animation'
import { useRouter } from 'next/router'

export default function ContactContent(){
  const router = useRouter()

    return (
        <>
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
              언제나 환영합니다.
            </h1>
            <div className="main-governing-text">
              교육센터를 통해 Brunner와 함께 할 수 있습니다. <br/>
              최선을 다해서 구성원들의 미래을 열어드리겠습니다. <br/>
              지금 바로 참여하십시요.
            </div>
            <div className="flex justify-center">
              <button  onClick={() => router.push('/mainPages/content/view/contactView')} className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">
                교육 센터
              </button>
            </div>
          </div>
          <div className="lg:h-2/6 lg:w-2/6">
            <ContactContentAnimation/>
          </div>
        </>
    );
}