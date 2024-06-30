import React, { useState, useEffect, useRef } from 'react';
import { useTable, useSortBy } from 'react-table';
import requestServer from './../../../components/requestServer';
import { useRouter } from 'next/router';

export default function AssetContent() {
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const [amountInput, setAmountInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [editedRows, setEditedRows] = useState(new Set()); // Set to track edited rows
  const inputRefs = useRef({}); // Ref for input elements

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await requestGetIncomeHistory();
    setTableData(data);
    setEditedRows(new Set()); // Reset edited rows on data fetch
  };

  const requestGetIncomeHistory = async () => {
    const userId = getLoginUserId();
    if (!userId) return [];

    const jRequest = {
      commandName: 'asset.getIncomeHistory',
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userId,
    };

    const jResponse = await requestServer('POST', JSON.stringify(jRequest));

    if (jResponse.error_code === 0) {
      return jResponse.incomeHistory;
    } else {
      alert(JSON.stringify(jResponse.error_message));
      return [];
    }
  };

  const getLoginUserId = () => {
    const userInfo = process.env.userInfo;
    return userInfo ? userInfo.userId : null;
  };

  const handleAddIncome = async () => {
    const userId = getLoginUserId();
    if (!userId) return;
    if (!amountInput) {
      alert("금액을 입력해주세요.");
      return;
    }
    if (!commentInput) {
      alert("코멘트를 입력해주세요.");
      return;
    }

    const jRequest = {
      commandName: 'asset.addIncome',
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userId,
      amount: Number(amountInput.replace(/[^0-9.-]/g, '').replace(/,/g, '')), // 숫자로 변환하여 전송
      comment: commentInput,
    };

    const jResponse = await requestServer('POST', JSON.stringify(jRequest));

    if (jResponse.error_code === 0) {
      alert('신규 수익 내역이 추가되었습니다.');
      fetchData(); // 데이터 다시 가져오기
      setAmountInput('');
      setCommentInput('');
    } else {
      alert(JSON.stringify(jResponse.error_message));
    }
  };

  const handleInputChange = (e, inputName) => {
    const { value } = e.target;
    if (inputName === 'amountInput') {
      // 숫자만 입력되도록 처리 (콤마 자동 추가)
      const formattedValue = value.replace(/[^0-9.-]/g, '').replace(/,/g, '').toLocaleString();
      setAmountInput(formattedValue);
    } else if (inputName === 'commentInput') {
      setCommentInput(value);
    }
  };

  const handleEdit = (rowIndex, columnId, value) => {
    const newData = [...tableData];
    let parsedValue = value.replace(/[^0-9.-]/g, '').replace(/,/g, ''); // 숫자로 변환하여 콤마 제거
    newData[rowIndex][columnId] = parsedValue;
    setTableData(newData);
    setEditedRows((prevEditedRows) => new Set([...prevEditedRows, rowIndex]));
  };

  const handleSave = async (row) => {
    const userId = getLoginUserId();
    if (!userId) return;

    let amount = row.values.amount;
    // Remove commas from amount string before converting to number
    amount = amount.replace(/,/g, '');

    // Check if amount is a valid number
    if (isNaN(Number(amount))) {
      alert('유효하지 않은 금액 형식입니다.');
      return;
    }

    const jRequest = {
      commandName: 'asset.updateIncome',
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userId,
      historyId: row.original.history_id,
      amount: Number(amount), // Convert to number
      comment: row.values.comment,
    };

    const jResponse = await requestServer('POST', JSON.stringify(jRequest));

    if (jResponse.error_code === 0) {
      alert('수익 내역이 수정되었습니다.');
      fetchData(); // 데이터 다시 가져오기
      setEditedRows((prevEditedRows) => {
        const updatedRows = new Set(prevEditedRows);
        updatedRows.delete(row.index); // 편집 상태 제거
        return updatedRows;
      });
    } else {
      alert(JSON.stringify(jResponse.error_message));
      fetchData(); // 실패 시 데이터 다시 가져오기
    }
  };

  const handleRefresh = () => {
    fetchData(); // 데이터 새로고침
  };

  const handleDelete = async (rowIndex) => {
    const userId = getLoginUserId();
    if (!userId) return;

    const historyId = tableData[rowIndex].history_id;

    const jRequest = {
      commandName: 'asset.deleteIncome',
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userId,
      historyId: historyId,
    };

    const jResponse = await requestServer('POST', JSON.stringify(jRequest));

    if (jResponse.error_code === 0) {
      alert('수익 내역이 삭제되었습니다.');
      fetchData(); // 데이터 다시 가져오기
    } else {
      alert(JSON.stringify(jResponse.error_message));
      fetchData(); // 실패 시 데이터 다시 가져오기
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'history_id',
        colorClass: 'bg-blue-500 text-blue-100',
        headerClassName: 'text-center',
        Cell: ({ row }) => (
          <div className='text-center text-sm text-black dark:text-gray-300'>
            {row.values.history_id}
          </div>
        )
      },
      {
        Header: 'Date&Time',
        accessor: 'create_time',
        colorClass: 'bg-orange-500 text-orange-100',
        headerClassName: 'text-center',
        Cell: ({ row }) => (
          <div className='text-center text-sm text-black dark:text-gray-300'>
            {row.values.create_time}
          </div>
        ),
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        colorClass: 'bg-blue-500 text-blue-100',
        headerClassName: 'text-right', // 우측 정렬 헤더
        Cell: ({ row }) => (
          <div className="text-right w-full">
            <input
              type="text"
              ref={(el) => inputRefs.current[row.index] = el} // Ref 설정
              className={`border-0 focus:ring-0 bg-transparent w-20 text-sm text-gray-900 dark:text-gray-300`}
              value={Number(row.values.amount).toLocaleString()} // Amount with comma separators
              onChange={(e) => handleEdit(row.index, 'amount', e.target.value)}
            />
          </div>
        ),
      },
      {
        Header: 'Comment',
        accessor: 'comment',
        colorClass: 'bg-green-500 text-green-100',
        headerClassName: 'text-center', // 가운데 정렬 헤더
        Cell: ({ row }) => (
          <div className="text-center w-full">
            <input
              type="text"
              ref={(el) => inputRefs.current[row.index] = el} // Ref 설정
              className={`border-0 focus:ring-0 bg-transparent w-40 text-sm text-gray-900 dark:text-gray-300`}
              value={row.values.comment}
              onChange={(e) => handleEdit(row.index, 'comment', e.target.value)}
            />
          </div>
        ),
      },
      {
        Header: 'Save',
        accessor: 'actions',
        colorClass: 'bg-purple-500 text-green-100',
        headerClassName: 'text-center', // 헤더 가운데 정렬
        Cell: ({ row }) => (
          <div className="flex justify-center">
            <button onClick={() => handleSave(row)} className="text-sm text-yellow-600 py-1 px-3 rounded">
              저장
            </button>
            <button onClick={() => handleDelete(row.index)} className="text-sm text-red-600 py-1 px-3 rounded">
              삭제
            </button>
          </div>
        ),
      }
    ],
    [editedRows]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data: tableData,
    initialState: { hiddenColumns: ['history_id'] }
  }, useSortBy); // useSortBy 추가

  return (
    <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center">
      <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
        내자산
      </h1>
      <div className="main-governing-text mt-5">
        내자산은 내가 지킨다. <br />
        시야를 넓혀 최고 수익에 도전하세요.
      </div>
      <div className="mb-5 flex items-center w-full">
        <input
          type="text"
          ref={(el) => (inputRefs.current['amountInput'] = el)} // Ref 설정
          name="amountInput"
          value={amountInput}
          onChange={(e) => handleInputChange(e, 'amountInput')}
          placeholder="금액"
          className="mr-3 p-2 border rounded dark:text-gray-300 text-right" // 우측 정렬
        />
        <div className="relative flex-grow">
          <input
            type="text"
            ref={(el) => (inputRefs.current['commentInput'] = el)} // Ref 설정
            name="commentInput"
            value={commentInput}
            onChange={(e) => handleInputChange(e, 'commentInput')}
            placeholder="코멘트"
            className="p-2 border rounded dark:text-gray-300 w-full" // 코멘트 입력란의 폭을 넓힘
            style={{ marginLeft: '-2px' }}
          />
        </div>
        <button
          onClick={handleAddIncome}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 ml-3"
          style={{ alignSelf: 'flex-end' }} // 추가 버튼을 오른쪽으로 이동
        >
          추가
        </button>
      </div>
      <button
        onClick={handleRefresh}
        className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg mb-3"
      >
        새로고침
      </button>
      <div className="overflow-x-auto w-full">
        <table {...getTableProps()} className="border-collapse w-full">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-100">
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className={`py-2 px-3 text-xs font-medium tracking-wider ${column.colorClass} text-center`}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' ▼'
                          : ' ▲'
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="py-1 px-0 w-0">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
