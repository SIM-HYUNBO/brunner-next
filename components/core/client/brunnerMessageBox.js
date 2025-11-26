import React, { useState } from "react";
import Loading from "@/components/core/client/loading";
import { Input, Button } from "antd";
import * as constants from "@/components/core/constants";

export const useModal = () => {
  const [modalContent, setModalContent] = useState({
    isOpen: false,
    message: constants.General.EmptyString,
    inputVisible: false,
    inputValue: "",
    onConfirm: () => {},
    onClose: () => {},
  });

  const [loading, setLoading] = useState(false);

  /** ✔ 일반 메시지 확인 모달 */
  const openModal = (message) => {
    return new Promise((resolve, reject) => {
      setModalContent((prev) => ({
        ...prev,
        isOpen: true,
        message,
        inputVisible: false,
        inputValue: "",
        onConfirm: () => {
          resolve(true);
          closeModal();
        },
        onClose: () => {
          reject(false);
          closeModal();
        },
      }));
    });
  };

  /** ✨ 입력 모달 */
  const openInputModal = (message) => {
    return new Promise((resolve, reject) => {
      setModalContent((prev) => ({
        ...prev,
        isOpen: true,
        message,
        inputVisible: true,
        inputValue: "",
        onConfirm: () => {
          setModalContent((current) => {
            resolve(current.inputValue); // ⭕ 최신값 사용!
            return {
              ...current,
              isOpen: false,
            };
          });
        },
        onClose: () => {
          reject(null);
          closeModal();
        },
      }));
    });
  };

  const closeModal = () => {
    setModalContent({
      isOpen: false,
      message: constants.General.EmptyString,
      inputVisible: false,
      inputValue: "",
      onConfirm: () => {},
      onClose: () => {},
    });
  };

  const BrunnerMessageBox = () => {
    if (!modalContent.isOpen) return null;

    const isObject = (value) =>
      value && typeof value === "object" && !Array.isArray(value);

    return (
      <>
        {loading && <Loading />}

        <div className="flex items-center justify-center z-[1000001] fixed inset-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm"></div>

          <div className="semi-text-bg-color rounded-lg p-8 h-auto w-auto max-w-screen z-50">
            <p className="text-lg dark:text-gray-200 text-left mb-4 whitespace-pre-line">
              {isObject(modalContent.message)
                ? JSON.stringify(modalContent.message)
                : modalContent.message}
            </p>

            {modalContent.inputVisible && (
              <Input
                className="mb-4"
                autoFocus
                value={modalContent.inputValue}
                onChange={(e) =>
                  setModalContent((prev) => ({
                    ...prev,
                    inputValue: e.target.value,
                  }))
                }
              />
            )}

            <div className="flex justify-center">
              <Button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold mr-2 px-4 py-2"
                onClick={modalContent.onConfirm}
              >
                OK
              </Button>

              <Button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={modalContent.onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return { BrunnerMessageBox, openModal, openInputModal, setLoading, loading };
};
