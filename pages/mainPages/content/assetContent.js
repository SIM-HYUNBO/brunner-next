"use strict";

import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import DivContainer from "@/components/divContainer";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import RequestServer from "@/components/requestServer";
import BrunnerMessageBox from "@/components/brunnerMessageBox";
import BrunnerTable from '@/components/brunnerTable';

export default function AssetContent() {
  useEffect(() => {
  }, []);

  const [loading, setLoading] = useState(false);

  const [modalContent, setModalContent] = useState({
    isOpen: false,
    message: "",
    onConfirm: () => {},
    onClose: () => {},
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
      onConfirm: () => {},
      onClose: () => {},
    });
  };
 
  const brunnerTableRef = useRef();

  const ch = [
    { Header: 'ID', 
      accessor: 'history_id', 
      type: 'text', 
      editable: false,
      hidden: true, 
      input_hidden: true, 
      headerClassName: 'text-center bg-blue-500 text-blue-100 !important'
    },
    { Header: 'Date&Time', 
      accessor: 'create_time', 
      type: 'datetime-local', 
      editable: false,
      headerClassName: 'text-center bg-orange-500 text-orange-100 !important', 
      formatter: (value) => moment(value).format("YYYY-MM-DD HH:mm:ss") 
    },
    { Header: 'Amount', 
      accessor: 'amount', 
      type: 'number', 
      editable: true,
      headerClassName: 'text-center bg-blue-500 text-blue-100 !important'
    },
    { Header: 'Comment', 
      accessor: 'comment', 
      type: 'text', 
      editable: true,
      headerClassName: 'text-center bg-green-500 text-green-100 !important'
    },
  ];

  const requestTableData = async () => {
    const userId = userInfo.getLoginUserId();
    if (!userId) return [];

    try {
      setLoading(true);

      const jRequest = {
        commandName: constants.commands.COMMAND_TB_COR_INCOME_HIST_SELECTBYUSERID,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
      };

      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false);

      if (jResponse.error_code === 0) {
        return jResponse.incomeHistory;
      } else {
        openModal(jResponse.error_message);
        return [];
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
      return [];
    }
  };

  const requestUpdateTableData = async (row) => {
    const userId = userInfo.getLoginUserId();
    if (!userId) return;

    try {
      setLoading(true);

      const jRequest = {
        commandName: constants.commands.COMMAND_TB_COR_INCOME_HIST_UPDATEONE,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
        historyId: row.original.history_id,
        amount: Number(row.values.amount),
        comment: row.values.comment,
      };

      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false);

      if (jResponse.error_code === 0) {
        openModal("Successfully updated.");
        brunnerTableRef.current.fetchTableData();
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  const requestDeleteTableData = async (row) => {
    const userId = userInfo.getLoginUserId();
    if (!userId) return;

    const deleteConfirm = await openModal(constants.messages.MESSAGE_DELETE_ITEM);
    if (!deleteConfirm) return;

    setLoading(true);
    const historyId = row.values.history_id;

    try {
      const jRequest = {
        commandName: constants.commands.COMMAND_TB_COR_INCOME_HIST_DELETEONE,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
        historyId: historyId,
      };

      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false);

      if (jResponse.error_code === 0) {
        openModal(constants.messages.MESSAGE_SUCCESS_DELETED);
        brunnerTableRef.current.fetchTableData();
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  const requestAddNewTableData = async (inputValues) => {
    const userId = userInfo.getLoginUserId();
    if (!userId) return;

    for (const key in inputValues) {
      const column = ch.find((header) => header.accessor === key);
      if (!inputValues[key] && column && !column.input_hidden) {
        openModal(`Please fill in the ${key}.`);
        return;
      }
    }

    try {
      setLoading(true);
      const jRequest = {
        commandName: constants.commands.COMMAND_TB_COR_INCOME_HIST_INSERTONE,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
        ...inputValues,
      };

      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false);

      if (jResponse.error_code === 0) {
        openModal(constants.messages.MESSAGE_SUCCESS_ADDED);
        brunnerTableRef.current.fetchTableData();
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
    }  
  }

  return (
    <>
      {modalContent.isOpen && (
        <BrunnerMessageBox
          isOpen={modalContent.isOpen}
          message={modalContent.message}
          onConfirm={modalContent.onConfirm}
          onClose={modalContent.onClose}
        />
      )}

      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}     
      
      <DivContainer>
      <div className="w-full px-1">
        <BrunnerTable ref={brunnerTableRef}
                      columnHeaders={ch} 
                      tableTitle='Asset History'
                      requestTableData={requestTableData}
                      requestAddNewTableData={requestAddNewTableData}
                      requestUpdateTableData={requestUpdateTableData}
                      requestDeleteTableData={requestDeleteTableData}
                      />
      </div>

      </DivContainer>
    </>
  );
}