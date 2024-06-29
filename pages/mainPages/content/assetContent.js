import React, { useState, useEffect, useRef } from 'react';
import { useTable } from 'react-table';
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
      comments: commentInput,
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
    const newValue = value.replace(/,/g, ''); // 콤마 제거
    newData[rowIndex][columnId] = newValue;
    setTableData(newData);
    setEditedRows((prevEditedRows) => new Set([...prevEditedRows, rowIndex])); // Track edited row
  };

  const handleSave = async (row) => {
    const userId = getLoginUserId();
    if (!userId) return;

    const jRequest = {
      commandName: 'asset.updateIncome',
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userId,
      historyId: row.original.history_id,
      amount: Number(row.values.amount.replace(/[^0-9.-]/g, '').replace(/,/g, '')), // 숫자로 변환하여 전송
      comments: row.values.comments,
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

  const handleDelete = async (rowIndex) => {
    const userId = getLoginUserId();
    if (!userId) return;

    const confirmed = window.confirm("정말로 이 항목을 삭제하시겠습니까?");
    if (!confirmed) return;

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
      const updatedData = tableData.filter((item, index) => index !== rowIndex);
      setTableData(updatedData);
    } else {
      alert(JSON.stringify(jResponse.error_message));
    }
  };

  const handleRefresh = () => {
    fetchData(); // 데이터 새로고침
  };

  const editColumn = {
    Header: 'Edit',
    accessor: 'edit',
    Cell: ({ row }) => (
      <button
        onClick={() => setEditedRows((prev) => new Set([...prev, row.index]))}
        className="mr-2 text-indigo-600 hover:text-indigo-900 bg-yellow-200 py-1 px-3 rounded"
      >
        편집
      </button>
    ),
  };

  const deleteColumn = {
    Header: 'Delete',
    accessor: 'delete',
    Cell: ({ row }) => (
      <button
        onClick={() => handleDelete(row.index)}
        className="text-red-600 hover:text-red-900"
      >
        삭제
      </button>
    ),
  };

  const columns = React.useMemo(
    () => [
      { Header: 'ID', accessor: 'history_id', colorClass: 'bg-blue-500 text-blue-100' },
      {
        Header: 'Date&Time',
        accessor: 'create_time',
        colorClass: 'bg-orange-500 text-orange-100',
        Cell: ({ row }) => (
          <input
            type="text"
            ref={(el) => inputRefs.current[row.index] = el} // Ref 설정
            className={`border-0 focus:ring-0 bg-transparent w-20 text-sm ${editedRows.has(row.index) ? 'text-gray-900 bg-yellow-200' : 'text-gray-500'}`} // 폭을 15 (숫자 15자리)으로 변경
            value={row.values.create_time}
            onChange={(e) => handleEdit(row.index, 'create_time', e.target.value)}
          />
        ),
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        colorClass: 'bg-blue-500 text-blue-100',
        Cell: ({ row }) => (
          <input
            type="text"
            ref={(el) => inputRefs.current[row.index] = el} // Ref 설정
            className={`border-0 focus:ring-0 bg-transparent w-20 text-sm ${editedRows.has(row.index) ? 'text-gray-900 bg-yellow-200' : 'text-gray-500'}`} // 폭을 20 (글자 7개 정도)으로 변경
            value={row.values.amount}
            onChange={(e) => handleEdit(row.index, 'amount', e.target.value)}
          />
        ),
      },
      {
        Header: 'Comment',
        accessor: 'comments',
        colorClass: 'bg-green-500 text-green-100',
        Cell: ({ row }) => (
          <input
            type="text"
            ref={(el) => inputRefs.current[row.index] = el} // Ref 설정
            className={`border-0 focus:ring-0 bg-transparent w-40 text-sm ${editedRows.has(row.index) ? 'text-gray-900 bg-yellow-200' : 'text-gray-500'}`} // 코멘트 입력란의 폭을 넓힘
            value={row.values.comments}
            onChange={(e) => handleEdit(row.index, 'comments', e.target.value)}
          />
        ),
      },
      editColumn,
      deleteColumn,
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
  });

  return (
    <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center">
      <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
        내자산
      </h1>
      <div className="main-governing-text mt-5">
        내자산은 내가 지킨다. <br />
        시야를 넓혀 최고 수익에 투자하세요.
      </div>
      <div className="mb-5 flex items-center w-full">
        <input
          type="text"
          ref={(el) => (inputRefs.current['amountInput'] = el)} // Ref 설정
          name="amountInput"
          value={amountInput}
          onChange={(e) => handleInputChange(e, 'amountInput')}
          placeholder="금액"
          className="mr-3 p-2 border rounded dark:text-gray-300"
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
                  <th {...column.getHeaderProps()} className={`py-2 px-3 text-xs font-medium tracking-wider ${column.colorClass}`}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="hover:bg-gray-100">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="py-2 px-3">
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
