import React, { useState, useEffect } from 'react';
import { useTable, useSortBy } from 'react-table';
import requestServer from './../../../components/requestServer';
import { useRouter } from 'next/router';
import moment from 'moment';
import BrunnerMessageBox from '@/components/BrunnerMessageBox'
import { log } from 'winston';
import { Console } from 'winston/lib/winston/transports';

export default function AssetContent() {
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const [amountInput, setAmountInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  useEffect(() => {

  }, []);

  const [modalContent, setModalContent] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => { },
    onClose: () => { }
  });

  // 모달 열기 함수
  const openModal = (message) => {
    return new Promise((resolve, reject) => {
      setModalContent({
        isOpen: true,
        message: message,
        onConfirm: (result) => { resolve(result); closeModal(); },
        onClose: () => { reject(false); closeModal(); }
      });
    });
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalContent({
      isOpen: false,
      message: '',
      onConfirm: () => { },
      onClose: () => { }
    });
  };

  // 수익 내역 데이터 가져오기
  const fetchData = async () => {
    const tableData = await requestGetIncomeHistory();
    setTableData(tableData);
    console.log(`tableData set:${tableData}`);
  };

  // 수익 내역 요청
  const requestGetIncomeHistory = async () => {
    const userId = getLoginUserId();
    if (!userId) return [];

    const jRequest = {
      commandName: 'asset.getIncomeHistory',
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userId,
    };

    setLoading(true); // 데이터 로딩 시작
    const jResponse = await requestServer('POST', JSON.stringify(jRequest));
    setLoading(false); // 데이터 로딩 시작

    if (jResponse.error_code === 0) {
      return jResponse.incomeHistory;
    } else {
      return [];
    }
  };

  // 로그인 사용자 ID 가져오기
  const getLoginUserId = () => {
    const userInfo = process.env.userInfo;
    return userInfo ? userInfo.userId : null;
  };

  // 수익 내역 추가 처리
  const handleAddIncome = async () => {
    const userId = getLoginUserId();
    if (!userId) return;
    if (!amountInput) {
      openModal("Input amount.");
      return;
    }
    if (!commentInput) {
      openModal("Input comment.");
      return;
    }

    setLoading(true);

    const jRequest = {
      commandName: 'asset.addIncome',
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userId,
      amount: Number(amountInput.replace(/[^0-9.-]/g, '').replace(/,/g, '')), // 숫자로 변환하여 전송
      comment: commentInput,
    };

    const jResponse = await requestServer('POST', JSON.stringify(jRequest));

    setLoading(false);

    if (jResponse.error_code === 0) {
      openModal('Successfully added.');
      fetchData(); // 데이터 다시 가져오기
      setAmountInput('');
      setCommentInput('');
    } else {
      openModal(JSON.stringify(jResponse.error_message));
    }
  };

  // 입력값 변경 처리
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

  // 저장 처리
  const handleSave = async (row) => {
    const userId = getLoginUserId();
    if (!userId) return;

    let amount = row.values.amount;
    // Ensure amount is always formatted as a string before replacing commas
    amount = String(amount).replace(/,/g, '');

    if (isNaN(Number(amount))) {
      openModal('Invalid number of amount.');
      return;
    }

    const jRequest = {
      commandName: 'asset.updateIncome',
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userId,
      historyId: row.original.history_id,
      amount: Number(amount), // 숫자로 변환
      comment: row.values.comment,
    };

    setLoading(true); // 데이터 로딩 시작
    const jResponse = await requestServer('POST', JSON.stringify(jRequest));
    setLoading(false); // 데이터 로딩 시작
    openModal('Successfully updated.');

    if (jResponse.error_code === 0) {
      fetchData(); // 데이터 다시 가져오기
    } else {
      openModal(JSON.stringify(jResponse.error_message));
      fetchData(); // 실패 시 데이터 다시 가져오기
    }
  };

  // 새로고침 처리
  const handleRefresh = () => {
    fetchData(); // 데이터 새로고침
  };

  // 삭제 처리
  const handleDelete = async (rowIndex) => {
    const userId = getLoginUserId();
    if (!userId) return;

    if (tableData.length === 0) {
      fetchData();
    }

    const deleteConfirm = await openModal("Delete this item?");
    if (!deleteConfirm)
      return;

    const historyId = tableData[rowIndex].history_id;

    setLoading(true); // 데이터 로딩 시작

    const jRequest = {
      commandName: 'asset.deleteIncome',
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userId,
      historyId: historyId,
    };

    const jResponse = await requestServer('POST', JSON.stringify(jRequest));

    setLoading(false); // 데이터 로딩 시작

    if (jResponse.error_code === 0) {
      openModal('Successfully deleted.');
      fetchData(); // 데이터 다시 가져오기
    } else {
      openModal(JSON.stringify(jResponse.error_message));
      fetchData(); // 실패 시 데이터 다시 가져오기
    }
  };

  // 수정 처리
  const handleEditAmount = (rowIdx, amount) => {
    if (tableData.length === 0) {
      // fetchData();
      return;
    }
    const updatedData = [...tableData];
    updatedData[rowIdx].amount = amount;
    setTableData(updatedData);
  };

  const handleEditComment = (rowIdx, comment) => {
    if (tableData.length === 0) {
      fetchData();
      return;
    }

    const updatedData = [...tableData];
    updatedData[rowIdx].comment = comment;
    setTableData(updatedData);
  };

  // 테이블 컬럼 정의
  const columns = React.useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'history_id',
        headerClassName: 'text-center bg-blue-500 text-blue-100',
        Cell: ({ row }) => (
          <div className='text-center text-sm text-black dark:text-gray-300'>
            {row.values.history_id}
          </div>
        )
      },
      {
        Header: 'Date&Time',
        accessor: 'create_time',
        headerClassName: 'text-center bg-orange-500 text-orange-100',
        Cell: ({ row }) => (
          <div className='text-center text-sm text-black dark:text-gray-300'>
            {getLocalTime(row.values.create_time)}
          </div>
        ),
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        headerClassName: 'text-center bg-blue-500 text-blue-100',
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
        Header: 'Comment',
        accessor: 'comment',
        headerClassName: 'text-center bg-green-500 text-green-100',
        Cell: ({ row }) => (
          <div className="text-center w-full">
            <input
              type="text"
              className={`border-0 focus:ring-0 bg-transparent w-40 text-sm text-gray-900 dark:text-gray-300`}
              value={row.values.comment || ''} // 코멘트 값이 undefined가 되지 않도록
              onChange={(e) => handleEditComment(row.index, e.target.value)}
            />
          </div>
        ),
      },
      {
        Header: 'Save',
        accessor: 'actions',
        headerClassName: 'text-center bg-purple-500 text-green-100',
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
    []
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

  const getLocalTime = (utcTime) => {
    return moment.utc(utcTime).local().format('YY-MM-DD HH:mm:ss');
  }

  return (
    <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center my-20">
      <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
        내자산
      </h1>
      <div className="main-governing-text mt-5">
        시야를 넓혀 최고 수익에 도전하고 <br />
        은퇴전 백억 자산가가 되세요.

      </div>
      <div className="mb-5 flex items-center w-full">
        <input
          type="text"
          name="amountInput"
          value={amountInput}
          onChange={(e) => handleInputChange(e, 'amountInput')}
          placeholder="금액"
          className="mr-3 p-2 border rounded dark:text-gray-300 text-right"
        />
        <div className="relative flex-grow">
          <input
            type="text"
            name="commentInput"
            value={commentInput}
            onChange={(e) => handleInputChange(e, 'commentInput')}
            placeholder="코멘트"
            className="p-2 border rounded dark:text-gray-300 w-full"
            style={{ marginLeft: '-2px' }}
          />
        </div>
        <button
          onClick={handleAddIncome}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 ml-3"
          style={{ alignSelf: 'flex-end' }}
        >
          추가
        </button>
      </div>
      <button
        onClick={handleRefresh}
        className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg mb-3"
      >
        내역보기
      </button>
      <BrunnerMessageBox
        isOpen={modalContent.isOpen}
        message={modalContent.message}
        onConfirm={modalContent.onConfirm}
        onClose={modalContent.onClose}
      />
      <div className="overflow-x-auto w-full">
        {loading && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        )}
        <table {...getTableProps()} className="border-collapse w-full">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-100">
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className={`py-2 px-3 text-xs font-medium tracking-wider ${column.headerClassName}`}>
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
