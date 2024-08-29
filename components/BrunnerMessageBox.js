`use strict`

import React from 'react';

const BrunnerMessageBox = ({ isOpen, message, onConfirm, onClose }) => {
    if (!isOpen) return null; // isOpen이 false면 모달을 렌더링하지 않음

    const handleConfirm = () => {
        onConfirm(true); // true를 인자로 전달하여 확인 결과를 전달
    };

    const handleClose = () => {
        onConfirm(false); // false를 인자로 전달하여 취소 결과를 전달
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="fixed inset-0 bg-gray-900 opacity-75"></div>
                <div className="dark:bg-slate-700 bg-slate-200 rounded-lg p-8 max-w-md w-full z-50">
                    <p className="text-lg dark:text-gray-200 text-center mb-4">{message}</p>
                    <div className="flex justify-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                            onClick={handleConfirm}
                        >
                            OK
                        </button>
                        <button
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
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

export default BrunnerMessageBox;
