import { useState } from 'react';

export const useModal = () => {
  const [modalContent, setModalContent] = useState({
    isOpen: false,
    message: "",
    onConfirm: () => { },
    onClose: () => { },
  });

  const openModal = (message) => {
    return new Promise((resolve, reject) => {
      setModalContent({
        isOpen: true,
        message: message,
        onConfirm: (result) => {
          resolve(result);
          closeModal();
        },
        onClose: () => {
          reject(false);
          closeModal();
        },
      });
    });
  };

  const closeModal = () => {
    setModalContent({
      isOpen: false,
      message: "",
      onConfirm: () => { },
      onClose: () => { },
    });
  };

  const BrunnerMessageBox = () => {
    const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

    if (!modalContent.isOpen) return null; // isOpen이 false면 모달을 렌더링하지 않음

    const handleConfirm = () => {
      modalContent.onConfirm(true); // true를 인자로 전달하여 확인 결과를 전달
    };

    const handleClose = () => {
      modalContent.onConfirm(false); // false를 인자로 전달하여 취소 결과를 전달
      modalContent.onClose();
    };

    return (
        <>
            <div className={`flex 
                             items-center 
                             justify-center 
                             z-50
                             fixed 
                             inset-0
                             `}>
                <div className={`fixed 
                                 inset-0 
                                 bg-gray-900 
                                 opacity-75
                                 `}></div>
                <div className={`bg-slate-200 
                                 dark:bg-slate-700 
                                 rounded-lg 
                                 p-8 
                                 max-w-md 
                                 w-full 
                                 z-50`}>
                    <p className={`text-lg 
                                   dark:text-gray-200 
                                   text-center 
                                   mb-4 whitespace-pre-line`}>
                        {isObject(modalContent.message) ? JSON.stringify(modalContent.message) : modalContent.message}
                    </p>
                    <div className={`flex justify-center`}>
                        <button
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2`}
                            onClick={handleConfirm}
                        >
                            OK
                        </button>
                        <button
                            className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded`}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

  return { BrunnerMessageBox, openModal };
};