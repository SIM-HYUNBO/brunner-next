import React, { useState } from "react";
import Loading from "@/components/core/client/loading";

export const useModal = () => {
  const [modalContent, setModalContent] = useState({
    isOpen: false,
    message: "",
    onConfirm: () => {},
    onClose: () => {},
  });

  // ✅ 로딩 상태 추가
  const [loading, setLoading] = useState(false);

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
      onConfirm: () => {},
      onClose: () => {},
    });
  };

  const BrunnerMessageBox = () => {
    const isObject = (value) =>
      value && typeof value === "object" && !Array.isArray(value);

    if (!modalContent.isOpen) return null;

    const handleConfirm = () => {
      modalContent.onConfirm(true);
    };

    const handleClose = () => {
      modalContent.onConfirm(false);
      modalContent.onClose();
    };

    return (
      <>
        {loading && <Loading />}
        <div
          className="flex 
             items-center 
             justify-center 
             z-[1000001] 
             fixed 
             inset-0"
        >
          <div
            className="fixed 
               inset-0 
               bg-gray-900 
               opacity-75"
          ></div>
          <div
            className="semi-text-bg-color 
             rounded-lg 
             p-8 
             h-auto
             w-auto 
             max-w-screen 
             z-50"
          >
            <p
              className="text-lg 
                          dark:text-gray-200 
                          text-left 
                          mb-4 
                          whitespace-pre-line"
            >
              {isObject(modalContent.message)
                ? JSON.stringify(modalContent.message)
                : modalContent.message}
            </p>
            <div className="flex justify-center">
              <button
                className="bg-blue-500 
                           hover:bg-blue-700 
                           text-white 
                           font-bold 
                           mr-2
                           px-4 
                           py-2"
                rounded
                onClick={handleConfirm}
              >
                OK
              </button>
              <button
                className="bg-gray-300 
                           hover:bg-gray-400 
                           text-gray-800 
                           font-bold 
                           py-2 
                           px-4 
                           rounded"
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

  // ✅ setLoading, loading 반환
  return { BrunnerMessageBox, openModal, setLoading, loading };
};
