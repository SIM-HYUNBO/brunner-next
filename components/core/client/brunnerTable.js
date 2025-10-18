`use strict`;

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useTable, useSortBy } from "react-table";

const BrunnerTable = forwardRef(
  (
    {
      tableTitle,
      columnHeaders,
      fetchTableData,
      addNewTableData,
      updateTableData,
      deleteTableData,
    },
    ref
  ) => {
    useEffect(() => {
      refreshTableData();
    }, []);

    const [tableData, setTableData] = useState([]);
    const tableDataRef = useRef(tableData);
    const setTableDataRef = (data) => {
      tableDataRef.current = data;
      setTableData(data);
    };

    const columns = React.useMemo(() => {
      const dynamicColumns = [
        ...columnHeaders.map((col) => {
          // `datetime-local` 타입의 컬럼을 처리
          if (col.type === "datetime-local") {
            return {
              ...col,
              // Cell 렌더링을 수정하여 클라이언트의 현지 시간으로 변환
              Cell: ({ value }) => {
                // 서버에서 받은 datetime 값을 Date 객체로 변환
                const serverTime = new Date(value);
                const formattedLocalDateTime = getClientTime(serverTime);

                return (
                  <input
                    type="datetime-local"
                    value={formattedLocalDateTime}
                    readOnly
                    className={`text-center dark-bg-color`}
                  />
                );
              },
            };
          }

          // `datetime-local`이 아닌 다른 컬럼은 원래의 설정대로 반환
          return col;
        }),
        {
          Header: "Actions",
          accessor: "actions",
          id: "actions",
          headerClassName:
            "text-center bg-purple-500 text-purple-100 w-[100px] !important",
          Cell: ({ row }) => (
            <div className={`flex justify-center`}>
              <Button
                onClick={() => updateTableData(row)}
                className={`p-2 rounded`}
                title="Save"
              >
                {" "}
                <img src="/save-icon.png" alt="Save" className={`w-6 h-6`} />
              </Button>
              <Button
                onClick={() => deleteTableData(row)}
                className={`p-2 rounded`}
                title="Delete"
              >
                <img
                  src="/delete-icon.png"
                  alt="Delete"
                  className={`w-6 h-6`}
                />
              </Button>
            </div>
          ),
        },
      ];

      return dynamicColumns;
    }, [columnHeaders]);

    const getClientTime = (serverTime) => {
      // 클라이언트의 타임존으로 변환
      const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const clientDateTime = new Date(
        serverTime.toLocaleString("en-US", {
          timeZone: clientTimeZone, // 클라이언트의 타임존
        })
      );

      const year = clientDateTime.getFullYear();
      const month = (clientDateTime.getMonth() + 1).toString().padStart(2, "0");
      const day = clientDateTime.getDate().toString().padStart(2, "0");
      const hours = clientDateTime.getHours().toString().padStart(2, "0");
      const minutes = clientDateTime.getMinutes().toString().padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const TableTitleArea = () => {
      return (
        <h2
          className={`title-font sm:text-4xl text-3xl w-full my-10 font-medium text-green-900`}
        >
          {tableTitle}
        </h2>
      );
    };

    const TableConditionArea = () => {
      return (
        <div
          className={`flex 
                       justify-end 
                       w-full 
                       p-4 
                       bg-gray-100 dark-bg-color
                       mt-2`}
        >
          <Button
            onClick={fetchTableData}
            className={`text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg mb-3`}
          >
            Refresh
          </Button>
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
        <div className="w-full overflow-x-auto">
          <table
            {...getTableProps()}
            className={`min-w-full 
                         w-full 
                         text-left 
                         table-auto 
                         mt-2`}
          >
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps({
                        className: `text-center 
                                ${
                                  column.headerClassName
                                    ? column.headerClassName
                                    : ""
                                }`,
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
                          className={`p-2 
                                  border-b 
                                  general-text-bg-color
                                  border-gray
                                  dark:border-gray 
                                  ${
                                    cell.column.type === "number"
                                      ? "text-right"
                                      : "text-left"
                                  }
                                  `}
                        >
                          {cell.column.id !== "actions" &&
                          cell.column.editable ? (
                            <EditableCell
                              value={cell.value}
                              rowIndex={row.index}
                              columnId={cell.column.id}
                              type={cell.column.type}
                              editable={cell.column.editable}
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
        </div>
      );
    };

    const EditableCell = ({
      value,
      rowIndex,
      columnId,
      type,
      editable,
      onValueChange,
    }) => {
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
        (type === "number" || type === "text" || type === "datetime-local") &&
          editable && (
            <input
              type={type}
              value={newValue}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`border p-1 rounded w-full max-w-full resize-none ${
                type === "number" ? "text-right" : "text-left"
              }`}
              autoFocus
            />
          )
      ) : (
        <span onClick={() => setIsEditing(true)}>{value}</span>
      );
    };

    const handleCellValueChange = (newValue, rowIndex, columnId) => {
      const updatedTableData = [...tableData];
      updatedTableData[rowIndex][columnId] = newValue;
      setTableDataRef(updatedTableData);
    };

    const TableInputDataArea = () => {
      const initialInputState = {};
      columnHeaders.forEach((header) => {
        initialInputState[header.accessor] = ``;
      });

      const [inputValues, setInputValues] = useState(initialInputState);

      const handleInputChange = (e, accessor) => {
        const { value } = e.target;
        setInputValues((prevState) => ({
          ...prevState,
          [accessor]: value,
        }));
      };

      return (
        <div className={`mb-2 table w-full dark-bg-color mt-2 p-2`}>
          {columnHeaders.map(
            (header) =>
              !header.input_hidden && (
                <div key={header.accessor} className="flex items-center mb-2">
                  <label
                    className="w-32 
                                mr-2 
                                text-sm 
                                font-medium 
                                medium-text-color"
                  >
                    {header.Header}
                  </label>
                  <input
                    type={header.type}
                    name={header.accessor}
                    value={inputValues[header.accessor]}
                    onChange={(e) => handleInputChange(e, header.accessor)}
                    placeholder={header.Header}
                    className={`p-2 
                            border 
                            rounded 
                            medium-text-color 
                            dark-bg-color 
                            flex-1 
                            ${
                              header.type === "number"
                                ? "text-right"
                                : "text-left"
                            }`}
                  />
                </div>
              )
          )}
          <Button
            onClick={() => {
              addNewTableData(inputValues);
            }}
            className={`bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-2`}
            style={{ alignSelf: "flex-end" }}
          >
            Add
          </Button>
        </div>
      );
    };

    // 부모 컴포넌트에서 호출할 수 있게 노출
    useImperativeHandle(ref, () => ({
      refreshTableData,
    }));

    const refreshTableData = async () => {
      const tableData = await fetchTableData();

      setTableDataRef(tableData);
    };

    return (
      <>
        <div>
          <div className={`w-full px-1`}>
            <TableTitleArea />
            <TableConditionArea />
            <TableBodyArea />
            <TableInputDataArea />
          </div>
        </div>
      </>
    );
  }
);

export default BrunnerTable;
