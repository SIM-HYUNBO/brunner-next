`use strict`;

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useTable, useSortBy } from "react-table";
import RequestServer from "@/components/requestServer";
import * as userInfo from "@/components/userInfo";
import moment from "moment";
import BrunnerMessageBox from "@/components/brunnerMessageBox";
import * as Constants from "@/components/constants";
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
  // }

  const router = useRouter();

  const [tableData, setTableData] = useState([]); // tableData를 변경하면 렌더링 되면서 값이 초기화 됨
  const tableDataRef = useRef(tableData); // state변수에 대한 참조
  const setTableDataRef = (data) => {
    tableDataRef.current = data;
    setTableData(data);
  };

  const [amountInput, setAmountInput] = useState("");
  const [commentInput, setCommentInput] = useState("");

  const fetchData = async function () {
    await fetchIncomeHistory();
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 수익 내역 데이터 가져오기
  const fetchIncomeHistory = async () => {
    const result = await requestGetIncomeHistory();
    setTableDataRef(result);
    console.log(
      `fetchData: tableData set as ${JSON.stringify(tableDataRef.current)}`
    );
  };

  // 수익 내역 요청
  const requestGetIncomeHistory = async () => {
    const userId = userInfo.getLoginUserId();
    if (!userId) return [];

    try {
      const jRequest = {
        commandName: Constants.COMMAND_ASSET_GET_INCOME_HISTORY,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
      };

      setLoading(true); // 데이터 로딩 시작
      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false); // 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        return jResponse.incomeHistory;
      } else {
        openModal(jResponse.error_message);
        return [];
      }
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error);
      return [];
    }
  };

  // 수익 내역 추가 처리
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
        commandName: Constants.COMMAND_ASSET_ADD_INCOME,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
        amount: Number(amountInput.replace(/[^0-9.-]/g, "").replace(/,/g, "")), // 숫자로 변환하여 전송
        comment: commentInput,
      };

      setLoading(true); // 데이터 로딩 시작
      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false);

      if (jResponse.error_code === 0) {
        openModal(Constants.MESSAGE_SUCCESS_ADDED);
        fetchIncomeHistory(); // 데이터 다시 가져오기
        setAmountInput("");
        setCommentInput("");
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error);
    }
  };

  // 입력값 변경 처리
  const handleInputChange = (e, inputName) => {
    const { value } = e.target;
    if (inputName === "amountInput") {
      // 숫자만 입력되도록 처리 (콤마 자동 추가)
      const formattedValue = value
        .replace(/[^0-9.-]/g, "")
        .replace(/,/g, "")
        .toLocaleString();
      setAmountInput(formattedValue);
    } else if (inputName === "commentInput") {
      setCommentInput(value);
    }
  };

  // 저장 처리
  const handleSave = async (row) => {
    const userId = userInfo.getLoginUserId();
    if (!userId) return;

    let amount = row.values.amount;
    // Ensure amount is always formatted as a string before replacing commas
    amount = String(amount).replace(/,/g, "");

    if (isNaN(Number(amount))) {
      openModal(Constants.MESSAGE_INVALIED_NUMBER_AMOUNT);
      return;
    }

    try {
      const jRequest = {
        commandName: Constants.COMMAND_ASSET_UPDATE_INCOME,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
        historyId: row.original.history_id,
        amount: Number(amount), // 숫자로 변환
        comment: row.values.comment,
      };

      setLoading(true); // 데이터 로딩 시작
      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false); // 데이터 로딩 끝

      openModal("Successfully updated.");

      if (jResponse.error_code === 0) {
        fetchIncomeHistory(); // 데이터 다시 가져오기
      } else {
        openModal(jResponse.error_message);
        fetchIncomeHistory(); // 실패 시 데이터 다시 가져오기
      }
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error);
    }
  };

  // 새로고침 처리
  const handleRefresh = () => {
    fetchIncomeHistory(); // 데이터 새로고침
  };

  // 삭제 처리
  const handleDelete = async (rowIndex) => {
    const userId = userInfo.getLoginUserId();
    if (!userId) return;

    const deleteConfirm = await openModal(Constants.MESSAGE_DELETE_ITEM);
    if (!deleteConfirm) return;

    const historyId = tableDataRef.current[rowIndex].history_id;

    try {
      const jRequest = {
        commandName: Constants.COMMAND_ASSET_DELETE_INCOME,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
        historyId: historyId,
      };

      setLoading(true); // 데이터 로딩 시작
      const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
      setLoading(false); // 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        openModal(Constants.MESSAGE_SUCCESS_DELETED);
        fetchIncomeHistory(); // 데이터 다시 가져오기
      } else {
        openModal(jResponse.error_message);
        fetchIncomeHistory(); // 실패 시 데이터 다시 가져오기
      }
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error);
    }
  };

  // 수정 처리
  const handleEditAmount = (rowIdx, amount) => {
    console.log(
      `handleEditAmount: tableData set as ${JSON.stringify(
        tableDataRef.current
      )}`
    );

    const updatedData = [...tableDataRef.current];
    updatedData[rowIdx].amount = amount;
    setTableDataRef(updatedData);
  };

  const handleEditComment = (rowIdx, comment) => {
    console.log(
      `handleEditComment: tableData set as ${JSON.stringify(
        tableDataRef.current
      )}`
    );

    const updatedData = [...tableDataRef.current];
    updatedData[rowIdx].comment = comment;
    setTableDataRef(updatedData);
  };

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
              value={Number(row.values.amount)} // 콤마 포함된 금액
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
              value={row.values.comment || ""} // 코멘트 값이 undefined가 되지 않도록
              onChange={(e) => handleEditComment(row.index, e.target.value)}
            />
          </div>
        ),
      },
      {
        Header: "Save",
        accessor: "actions",
        headerClassName: "text-center bg-purple-500 text-green-100",
        Cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => handleSave(row)}
              className="text-sm text-yellow-600 py-1 px-3 rounded"
            >
              Save
            </button>
            <button
              onClick={() => handleDelete(row.index)}
              className="text-sm text-red-600 py-1 px-3 rounded"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: tableData,
        initialState: { hiddenColumns: ["history_id"] },
      },
      useSortBy
    ); // useSortBy 추가

  const getLocalTime = (utcTime) => {
    return moment.utc(utcTime).local().format("YY-MM-DD HH:mm:ss");
  };

  return (
    <>
      <DivContainer>
        <BrunnerMessageBox
          isOpen={modalContent.isOpen}
          message={modalContent.message}
          onConfirm={modalContent.onConfirm}
          onClose={modalContent.onClose}
        />
        <div className="w-full pr-16 flex flex-col items-start text-left my-10">
          <h2 className="title-font text-3xl mb-10 font-medium text-green-900">
            My Asset History
          </h2>
          <div className="mb-5 table w-full">
            <input
              type="text"
              name="amountInput"
              value={amountInput}
              onChange={(e) => handleInputChange(e, "amountInput")}
              placeholder="Amount"
              className="mr-3 p-2 border rounded dark:text-gray-300 text-right table-column"
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
              />
            </div>
            <button
              onClick={handleAddIncome}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              style={{ alignSelf: "flex-end" }}
            >
              Add
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg mb-3"
          >
            Refresh
          </button>
          <div className="overflow-x-auto w-full">
            {loading && (
              <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            )}
            <table {...getTableProps()} className="border-collapse w-full">
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr
                    {...headerGroup.getHeaderGroupProps()}
                    className="bg-gray-100"
                  >
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        className={`py-2 px-3 text-xs font-medium tracking-wider ${column.headerClassName}`}
                      >
                        {column.render("Header")}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " ▼"
                              : " ▲"
                            : ""}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody
                {...getTableBodyProps()}
                className="divide-y divide-gray-200"
              >
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="">
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="py-1 px-0 w-0">
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DivContainer>
    </>
  );
}
