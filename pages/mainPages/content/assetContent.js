"use strict";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useTable, useSortBy } from "react-table";
import RequestServer from "@/components/requestServer";
import * as userInfo from "@/components/userInfo";
import moment from "moment";
import BrunnerMessageBox from "@/components/brunnerMessageBox";
import * as constants from "@/components/constants";
import DivContainer from "@/components/divContainer";

export default function AssetContent() {
  const [loading, setLoading] = useState(false);
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

  const router = useRouter();

  const [tableData, setTableData] = useState([]);
  const tableDataRef = useRef(tableData); 
  const setTableDataRef = (data) => {
    tableDataRef.current = data;
    setTableData(data);
  };

  const [amountInput, setAmountInput] = useState("");
  const [commentInput, setCommentInput] = useState("");

  const amountInputRef = useRef(null);  // Amount input ref
  const commentInputRef = useRef(null);  // Comment input ref

  useEffect(() => {
    fetchData();
  }, []);

  // 테이블 컬럼 정의
  const columns = React.useMemo(
    () => [
      {
        Header: "ID",
        accessor: "history_id",
        headerClassName: "text-center bg-blue-500 text-blue-100",
        Cell: ({ row }) => (
          <div className="text-center text-sm text-black dark:text-gray-300">
            {row.values.history_id}
          </div>
        ),
      },
      {
        Header: "Date&Time",
        accessor: "create_time",
        headerClassName: "text-center bg-orange-500 text-orange-100",
        Cell: ({ row }) => (
          <div className="text-center text-sm text-black dark:text-gray-300">
            {getLocalTime(row.values.create_time)}
          </div>
        ),
      },
      {
        Header: "Amount",
        accessor: "amount",
        headerClassName: "text-center bg-blue-500 text-blue-100",
        Cell: ({ row }) => (
          <div className="text-right w-full">
            <input
              type="text"
              className={`border-0 focus:ring-0 bg-transparent w-20 text-sm text-gray-900 dark:text-gray-300`}
              value={Number(row.values.amount)}
              onChange={(e) => handleEditAmount(row.index, e.target.value)}
            />
          </div>
        ),
      },
      {
        Header: "Comment",
        accessor: "comment",
        headerClassName: "text-center bg-green-500 text-green-100",
        Cell: ({ row }) => (
          <div className="text-center w-full">
            <input
              type="text"
              className={`border-0 focus:ring-0 bg-transparent w-40 text-sm text-gray-900 dark:text-gray-300`}
              value={row.values.comment || ""} 
              onChange={(e) => handleEditComment(row.index, e.target.value)}
            />
          </div>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        headerClassName: "text-center bg-purple-500 text-green-100",
        Cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => handleSave(row)}
              className="p-2 rounded"
              title="Save"
            >
              <img
                src="/save-icon.png"
                alt="Save"
                className="w-6 h-6"
              />
            </button>
            <button
              onClick={() => handleDelete(row.index)}
              className="p-2 rounded"
              title="Delete"
            >
              <img
                src="/delete-icon.png"
                alt="Delete"
                className="w-6 h-6"
              />
            </button>
          </div>
        ),
      }
    ],
    []
  );

  // 테이블 속성 정의
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: tableData,
        initialState: { hiddenColumns: ["history_id"] },
      },
      useSortBy
  );

  const fetchData = async function () {
    await fetchIncomeHistory();
  };

  const fetchIncomeHistory = async () => {
    const result = await requestGetIncomeHistory();
    setTableDataRef(result);
  };

  const requestGetIncomeHistory = async () => {
    const userId = userInfo.getLoginUserId();
    if (!userId) return [];

    try {
      const jRequest = {
        commandName: constants.commands.COMMAND_TB_COR_INCOME_HIST_SELECTBYUSERID,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
      };

      setLoading(true); 
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

  const handleAddIncome = async () => {
    const userId = userInfo.getLoginUserId();
    if (!userId) return;
    if (!amountInput) {
      openModal(`Input amount.`);
      return;
    }
    if (!commentInput) {
      openModal(`Input comment.`);
      return;
    }

    try {
      const jRequest = {
        commandName: constants.commands.COMMAND_TB_COR_INCOME_HIST_INSERTONE,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
        amount: Number(amountInput.replace(/[^0-9.-]/g, "").replace(/,/g, "")), 
        comment: commentInput,
      };

      setLoading(true); 
      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false);

      if (jResponse.error_code === 0) {
        openModal(constants.messages.MESSAGE_SUCCESS_ADDED);
        fetchIncomeHistory(); 
        setAmountInput("");
        setCommentInput("");
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false); 
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  const handleInputChange = (e, inputName) => {
    const { value } = e.target;
    if (inputName === "amountInput") {
      const formattedValue = value
        .replace(/[^0-9.-]/g, "")
        .replace(/,/g, "")
        .toLocaleString();
      setAmountInput(formattedValue);
    } else if (inputName === "commentInput") {
      setCommentInput(value);
    }
  };

  const handleSave = async (row) => {
    const userId = userInfo.getLoginUserId();
    if (!userId) return;

    let amount = row.values.amount;
    amount = String(amount).replace(/,/g, "");

    if (isNaN(Number(amount))) {
      openModal(constants.messages.MESSAGE_INVALIED_NUMBER_AMOUNT);
      return;
    }

    try {
      const jRequest = {
        commandName: constants.commands.COMMAND_TB_COR_INCOME_HIST_UPDATEONE,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
        historyId: row.original.history_id,
        amount: Number(amount), 
        comment: row.values.comment,
      };

      setLoading(true); 
      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false); 

      openModal("Successfully updated.");

      if (jResponse.error_code === 0) {
        fetchIncomeHistory();
      } else {
        openModal(jResponse.error_message);
        fetchIncomeHistory();
      }
    } catch (error) {
      setLoading(false); 
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  const handleRefresh = () => {
    fetchIncomeHistory(); 
  };

  const handleDelete = async (rowIndex) => {
    const userId = userInfo.getLoginUserId();
    if (!userId) return;

    const deleteConfirm = await openModal(constants.messages.MESSAGE_DELETE_ITEM);
    if (!deleteConfirm) return;

    const historyId = tableDataRef.current[rowIndex].history_id;

    try {
      const jRequest = {
        commandName: constants.commands.COMMAND_TB_COR_INCOME_HIST_DELETEONE,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
        historyId: historyId,
      };

      setLoading(true); 
      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false);

      if (jResponse.error_code === 0) {
        openModal(constants.messages.MESSAGE_SUCCESS_DELETED);
        fetchIncomeHistory(); 
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false); 
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  const getLocalTime = (timeString) => {
    return moment(timeString).format("YYYY-MM-DD HH:mm:ss");
  };

  return (
    <>
      <DivContainer>
        <table {...getTableProps()} className="w-full text-left table-auto">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()} className="p-2 border-b dark:border-slate-700">
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </DivContainer>

      <div className="mb-5 table w-full bg-slate-100 mt-2 p-2">
        <input
          type="text"
          name="amountInput"
          value={amountInput}
          onChange={(e) => handleInputChange(e, "amountInput")}
          placeholder="Amount"
          className="mr-3 p-2 border rounded dark:text-gray-300 text-right table-column"
          ref={amountInputRef}  // ref 추가
        />
        <div className="relative flex-grow">
          <input
            type="text"
            name="commentInput"
            value={commentInput}
            onChange={(e) => handleInputChange(e, "commentInput")}
            placeholder="Comment"
            className="p-2 border rounded dark:text-gray-300 w-full table-column"
            style={{ marginLeft: "-2px" }}
            ref={commentInputRef}  // ref 추가
          />
        </div>
        <button
          onClick={handleAddIncome}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 justify"
          style={{ alignSelf: "flex-end" }}
        >
          Add
        </button>
      </div>

      {modalContent.isOpen && (
        <BrunnerMessageBox
          isOpen={modalContent.isOpen}
          message={modalContent.message}
          onConfirm={modalContent.onConfirm}
          onClose={modalContent.onClose}
        />
      )}
    </>
  );
}
