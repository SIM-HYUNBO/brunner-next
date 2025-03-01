import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import moment from "moment";
import { useTable, useSortBy } from "react-table";
import DivContainer from "@/components/divContainer";
import { useRouter } from "next/router";

const BrunnerTable = forwardRef(({
  columnHeaders,
  tableTitle,
  requestTableData,
  requestAddNewTableData,
  requestUpdateTableData,
  requestDeleteTableData
}, ref) => {

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
      ...columnHeaders.map((col) => {
        // `datetime-local` 타입의 컬럼을 처리
        if (col.type === 'datetime-local') {
          return {
            ...col,
            // Cell 렌더링을 수정하여 클라이언트의 현지 시간으로 변환
            Cell: ({ value }) => {
              // 서버에서 받은 datetime 값을 Date 객체로 변환
              const serverDate = new Date(value);
  
              // 클라이언트의 타임존으로 변환
              const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
              const clientDateTime = new Date(serverDate.toLocaleString("en-US", {
                timeZone: clientTimeZone, // 클라이언트의 타임존
              }));
    
              const year = clientDateTime.getFullYear();
              const month = (clientDateTime.getMonth() + 1).toString().padStart(2, '0');
              const day = clientDateTime.getDate().toString().padStart(2, '0');
              const hours = clientDateTime.getHours().toString().padStart(2, '0');
              const minutes = clientDateTime.getMinutes().toString().padStart(2, '0');
  
              const formattedLocalDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
                
              return (
                <input
                  type="datetime-local"
                  value={formattedLocalDateTime}
                  readOnly
                  className="text-center bg-purple-100"
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
        headerClassName: 'text-center bg-purple-500 text-purple-100 !important',
        Cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => requestUpdateTableData(row)}
              className="p-2 rounded"
              title="Save"
            >
              <img src="/save-icon.png" alt="Save" className="w-6 h-6" />
            </button>
            <button
              onClick={() => requestDeleteTableData(row)}
              className="p-2 rounded"
              title="Delete"
            >
              <img src="/delete-icon.png" alt="Delete" className="w-6 h-6" />
            </button>
          </div>
        ),
      },
    ];
  
    return dynamicColumns;
  }, [columnHeaders]);

  const TableTitleArea = () => {
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
          onClick={requestTableData}
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

  const getLocalTime = (val) => {
    return new Date(cell.value.toLocaleString("en-US", { timeZoneName: "short" })).toISOString().slice(0, 16);
  }

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
                      {cell.column.id !== 'actions' && cell.column.editable ? (
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
    setTableDataRef(updatedTableData);
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
          onClick={() => { requestAddNewTableData(inputValues) }}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-2"
          style={{ alignSelf: "flex-end" }}
        >
          Add
        </button>
      </div>
    );
  };

  // 부모 컴포넌트에서 호출할 수 있게 노출
  useImperativeHandle(ref, () => ({
    fetchTableData,
  }));

  const fetchTableData = async () => {
    const tableData = await requestTableData();

    setTableDataRef(tableData);
  }


  return (
    <>
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
});

export default BrunnerTable; 
