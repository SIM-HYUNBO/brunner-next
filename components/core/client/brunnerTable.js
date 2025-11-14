`use strict`;

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as constants from "@/components/core/constants";
import { useTable, useSortBy } from "react-table";
import { Input, Button, Table } from "antd";

const BrunnerTable = forwardRef(
  (
    {
      tableTitle, // 제목
      FilteringConditions, // 조회조건
      columnHeaders, // 컬럼목록
      fetchTableDataHandler,
      addNewRowDataHandler,
      editRowDataHandler,
      deleteRowDataHandler,
      actionRowDataHandler,
      actionTitle,
    },
    ref
  ) => {
    const [tableData, setTableData] = useState([]);
    const tableDataRef = useRef(tableData);
    const setTableDataRef = (data) => {
      tableDataRef.current = data;
      setTableData(data);
    };

    const columns = React.useMemo(() => {
      const dynamicColumns = [
        ...columnHeaders?.map((col) => {
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
      ];

      if (editRowDataHandler || deleteRowDataHandler || actionRowDataHandler) {
        dynamicColumns.push({
          Header: "Actions",
          accessor: "actions",
          id: "actions",
          headerClassName:
            "text-center semi-text-bg-color w-[100px] !important",
          Cell: ({ row }) => (
            <div className={`flex justify-center`}>
              {editRowDataHandler && (
                <Button
                  onClick={() => editRowDataHandler(row)}
                  className={`p-2 rounded`}
                  title="Edit"
                >
                  {" "}
                  <img src="/save-icon.png" alt="Save" className={`w-6 h-6`} />
                </Button>
              )}
              {deleteRowDataHandler && (
                <Button
                  onClick={() => deleteRowDataHandler(row)}
                  className={`p-2 rounded`}
                  title="Delete"
                >
                  <img
                    src="/delete-icon.png"
                    alt="Delete"
                    className={`w-6 h-6`}
                  />
                </Button>
              )}
              {actionRowDataHandler && (
                <Button
                  onClick={() => actionRowDataHandler(row)}
                  className={`p-2 rounded`}
                  title={actionTitle ?? "Action"}
                >
                  <img
                    src="/action-icon.png"
                    alt="Execute"
                    className={`w-6 h-6`}
                  />
                </Button>
              )}{" "}
            </div>
          ),
        });
      }
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
      return <h2 className={`page-title`}>{tableTitle}</h2>;
    };

    const TableConditionArea = () => {
      return (
        <>
          {FilteringConditions && <FilteringConditions />}

          <div
            className={`flex 
                       justify-end 
                       w-full 
                       p-4 
                       bg-gray-100 dark-bg-color`}
          ></div>
        </>
      );
    };

    const TableBodyArea = () => {
      if (!tableData) return;
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
            <thead className="semi-text-bg-color">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps({
                        className: `text-center 
                                ${
                                  column.headerClassName
                                    ? column.headerClassName
                                    : constants.General.EmptyString
                                }`,
                      })}
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : constants.General.EmptyString}
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
        // ✅ checkbox일 때는 e.target.checked, 나머지는 e.target.value
        const val = type === "checkbox" ? e.target.checked : e.target.value;
        setNewValue(val);
      };

      // ✅ 타입별 렌더링 처리
      if (type === "checkbox") {
        return (
          <input
            type="checkbox"
            checked={!!newValue}
            onChange={(e) => {
              const checked = e.target.checked;
              setNewValue(checked);
              onValueChange(checked, rowIndex, columnId);
            }}
            className="cursor-pointer"
          />
        );
      }

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
        <span onClick={() => setIsEditing(true)}>
          {String(value ?? constants.General.EmptyString)}
        </span>
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
        switch (header.type) {
          case "number":
            initialInputState[header.accessor] = 0;
            break;
          case "checkbox":
            initialInputState[header.accessor] = false;
            break;
          case "datetime-local":
            initialInputState[header.accessor] = new Date()
              .toISOString()
              .slice(0, 16);
            break;
          default:
            initialInputState[header.accessor] = constants.General.EmptyString;
            break;
        }
      });

      const [inputValues, setInputValues] = useState(initialInputState);

      const handleInputChange = (e, accessor) => {
        const { value, checked } = e.target;
        setInputValues((prevState) => ({
          ...prevState,
          [accessor]: e.target.type == "checkbox" ? checked : value,
        }));
      };

      return (
        <div className={`mb-2 table w-full border mt-5 p-2`}>
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
          {addNewRowDataHandler && (
            <Button
              onClick={() => {
                addNewRowDataHandler(inputValues);
              }}
              className={`bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-2`}
              style={{ alignSelf: "flex-end" }}
            >
              Add
            </Button>
          )}
        </div>
      );
    };

    // 부모 컴포넌트에서 호출할 수 있게 노출
    useImperativeHandle(ref, () => ({
      refreshTableData,
    }));

    const refreshTableData = async () => {
      if (!fetchTableDataHandler) return;

      const tableData = await fetchTableDataHandler();

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
