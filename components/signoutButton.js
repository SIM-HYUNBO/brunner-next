import requestServer from './requestServer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import BrunnerMessageBox from './BrunnerMessageBox';

export default function SignoutButton() {

  const [modalContent, setModalContent] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => { },
    onClose: () => { }
  });

  // 모달 열기 함수
  const openModal = (message) => {
    return new Promise((resolve, reject) => {
      setModalContent({
        isOpen: true,
        message: message,
        onConfirm: (result) => { resolve(result); closeModal(); },
        onClose: () => { reject(false); closeModal(); }
      });
    });
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalContent({
      isOpen: false,
      message: '',
      onConfirm: () => { },
      onClose: () => { }
    });
  };

  const router = useRouter();

  const requestSignout = async () => {
    var jRequest = {};
    var jResponse = null;

    jRequest.commandName = "security.signout";
    var userInfo = process.env.userInfo ? process.env.userInfo : null;

    jRequest.userId = userInfo?.USER_ID;

    jResponse = await requestServer('POST', JSON.stringify(jRequest));

    if (jResponse.error_code == 0) {
      process.env.userInfo = null;
      router.push('/')
    } else {
      openModal(result.error_message);
    }
  }

  const getLoginId = () => {
    var userInfo = null;

    if (process.env.userInfo) {
      userInfo = process.env.userInfo;

      return userInfo?.userId;
    }
    return null;
  }

  return (
    <>
      <BrunnerMessageBox
        isOpen={modalContent.isOpen}
        message={modalContent.message}
        onConfirm={modalContent.onConfirm}
        onClose={modalContent.onClose}
      />

      {getLoginId() &&
        <button className="inline-flex items-center 
                                  boder-0 
                                  py-1 
                                  px-3 
                                  focus:outline-none 
                                bg-gray-100  
                                hover:bg-gray-50 
                                hover:text-orange-500
                                dark:bg-slate-600
                                dark:text-yellow-600 
                                dark:hover:text-yellow-300 
                                rounded text-base mt-4 md:mt-0"
          type="button"
          onClick={async () => {
            var result = await openModal("Do you want to logout now?")
            if (result)
              requestSignout();
          }}>

          <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </button>}
    </>
  );
}