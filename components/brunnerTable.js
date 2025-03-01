import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import { useTable, useSortBy } from "react-table";
import DivContainer from "@/components/divContainer";
import RequestServer from "@/components/requestServer";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import BrunnerMessageBox from "@/components/brunnerMessageBox";
import { useRouter } from "next/router";

export default function BrunnerTable({ columnHeaders, tableTitle }) {
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

  const router = useRouter();

  useEffect(() => {
    fetchTableData();
  }, []);

  const [tableData, setTableData] = useState([]);
  const tableDataRef = useRef(tableData);
  const setTableDataRef = (data) => {
    tableDataRef.current = data;
    setTableData(data);
  };

  const columns = React.useMemo(() => {
    const dynamicColumns = [
      ...columnHeaders.map((col) => ({
        ...col
      })),
      {
        Header: "Actions",
        accessor: "actions",
        id: "actions",
        headerClassName: 'text-center bg-purple-500 text-purple-100 !important',
        Cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => handleUpdateTableData(row)}
              className="p-2 rounded"
              title="Save"
            >
              <img src="/save-icon.png" alt="Save" className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleDeleteTableData(row.index)}
              className="p-2 rounded"
              title="Delete"
            >
              <img src="/delete-icon.png" alt="Delete" className="w-6 h-6" />
            </button>
          </div>
        ),
      }
    ];

    return dynamicColumns;
  }, [columnHeaders]);

  const fetchTableData = async () => {
    const result = await requestTableData();
    setTableDataRef(result);
  };

  const requestTableData = async () => {
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

  const TableTitleArea = () => {
    const tableTitle = 'Asset History';
    return (
      <h2 className="title-font sm:text-4xl text-3xl w-full my-10 font-medium text-green-900">
        {tableTitle}
      </h2>
    );
  };

  const TableConditionArea = () => {
    return (
      <div className="flex justify-end w-full p-4 bg-gray-100 mt-2">
        <button
          onClick={handleRefresh}
          className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg mb-3"
        >
          Refresh
        </button>
      </div>
    );
  };

  const TableBodyArea = () => {
    const hiddenColumns = columns
      .filter((column) => column.hidden)
      .map((column) => column.accessor || column.id);

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable(
      {
        columns: columns,
        data: tableData,
        initialState: {
          hiddenColumns: hiddenColumns,
        },
      },
      useSortBy
    );

    return (
      <table {...getTableProps()} className="w-full text-left table-auto mt-2">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps({
                    className: `text-center ${column.headerClassName ? column.headerClassName : ""}`,
                  })}
                >
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
                    <td
                      {...cell.getCellProps()}
                      className="p-2 border-b dark:border-slate-700"
                    >
                      {cell.column.id !== 'actions' ? (
                        <EditableCell
                          value={cell.value}
                          rowIndex={row.index}
                          columnId={cell.column.id}
                          onValueChange={handleCellValueChange}
                        />
                      ) : (
                        cell.render("Cell")
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const EditableCell = ({ value, rowIndex, columnId, onValueChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newValue, setNewValue] = useState(value);

    const handleBlur = () => {
      setIsEditing(false);
      onValueChange(newValue, rowIndex, columnId);
    };

    const handleChange = (e) => {
      setNewValue(e.target.value);
    };

    return isEditing ? (
      <input
        type="text"
        value={newValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="border p-1 rounded"
        autoFocus
      />
    ) : (
      <span onClick={() => setIsEditing(true)}>{value}</span>
    );
  };

  const handleCellValueChange = (newValue, rowIndex, columnId) => {
    const updatedTableData = [...tableData];
    updatedTableData[rowIndex][columnId] = newValue;
    setTableData(updatedTableData);
  };

  const handleUpdateTableData = async (row) => {
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
        fetchTableData();
      } else {
        openModal(jResponse.error_message);
        fetchTableData();
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  const handleRefresh = () => {
    fetchTableData();
  };

  const handleDeleteTableData = async (rowIndex) => {
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
        fetchTableData();
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  const TableInputDataArea = () => {
    const initialInputState = {};
    columnHeaders.forEach((header) => {
      initialInputState[header.accessor] = "";
    });

    const [inputValues, setInputValues] = useState(initialInputState);

    const handleInputChange = (e, accessor) => {
      const { value } = e.target;
      setInputValues((prevState) => ({
        ...prevState,
        [accessor]: value,
      }));
    };

    const handleAddNewTableData = async () => {
      const userId = userInfo.getLoginUserId();
      if (!userId) return;

      for (const key in inputValues) {
        if (!inputValues[key] && columnHeaders.some(header => header.accessor === key && !header.hidden)) {
          openModal(`Please fill in the ${key}.`);
          return;
        }
      }

      try {
        const jRequest = {
          commandName: constants.commands.COMMAND_TB_COR_INCOME_HIST_INSERTONE,
          systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
          userId: userId,
          ...inputValues,
        };

        setLoading(true);
        const jResponse = await RequestServer("POST", JSON.stringify(jRequest));
        setLoading(false);

        if (jResponse.error_code === 0) {
          openModal(constants.messages.MESSAGE_SUCCESS_ADDED);
          fetchTableData();
          setInputValues(initialInputState);
        } else {
          openModal(jResponse.error_message);
        }
      } catch (error) {
        setLoading(false);
        openModal(error.message);
        console.error(`message:${error.message}\n stack:${error.stack}\n`);
      }
    };

    return (
      <div className="mb-2 table w-full bg-slate-100 mt-2 p-2">
        {columnHeaders.map((header) => (
          !header.input_hidden && (
            <div key={header.accessor} className="flex items-center">
              <label className="mr-2 text-sm">{header.Header}</label>
              <input
                type={header.type}
                name={header.accessor}
                value={inputValues[header.accessor]}
                onChange={(e) => handleInputChange(e, header.accessor)}
                placeholder={header.Header}
                className={`mr-3 p-2 border rounded dark:text-gray-300 w-full ${
                  header.type === "number" ? "text-right" : "text-left"
                }`}
              />
            </div>
          )
        ))}
        <button
          onClick={handleAddNewTableData}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-2"
          style={{ alignSelf: "flex-end" }}
        >
          Add
        </button>
      </div>
    );
  };

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

      <DivContainer>
        <div className="w-full px-1">
          <TableTitleArea />
          <TableConditionArea />
          <TableBodyArea />
          <TableInputDataArea />
        </div>
      </DivContainer>
    </>
  );
}
