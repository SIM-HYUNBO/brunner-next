'use strict';

import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import requestServer from './../../../components/requestServer';
import { useRouter } from 'next/router';

export default function AssetContent() {
  const router = useRouter();
  const [tableData, setTableData] = useState([]);
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await requestGetIncomeHistory();
    setTableData(data);
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

    const jRequest = {
      commandName: 'asset.addIncome',
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userId,
      amount: amount,
      comments: comment,
    };

    const jResponse = await requestServer('POST', JSON.stringify(jRequest));

    if (jResponse.error_code === 0) {
      alert('신규 수익 내역이 추가되었습니다.');
      fetchData(); // 데이터 다시 가져오기
      setAmount('');
      setComment('');
    } else {
      alert(JSON.stringify(jResponse.error_message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      setAmount(value);
    } else if (name === 'comment') {
      setComment(value);
    }
  };

  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center">
        <h1 className="title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900">
          내자산
        </h1>
        <div className="main-governing-text mt-5">
          내자산은 내가 지킨다. <br />
          시야를 넓혀 최고 수익에 투자하세요.
        </div>
        <div className="mb-5">
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={handleInputChange}
            placeholder="금액"
            className="mr-3 p-2 border rounded dark:text-gray-300"
          />
          <input
            type="text"
            name="comment"
            value={comment}
            onChange={handleInputChange}
            placeholder="코멘트"
            className="mr-3 p-2 border rounded dark:text-gray-300 w-full"
          />
          <button
            className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
            onClick={handleAddIncome}
          >
            추가
          </button>
        </div>
        <button
          className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
          onClick={fetchData}
        >
          새로고침
        </button>
        <Table data={tableData} />
      </div>
      <div className="lg:h-2/6 lg:w-2/6">
        {/* <SupportContentAnimation /> */}
      </div>
    </>
  );
}

function Table({ data }) {
  const columns = React.useMemo(
    () => [
      { Header: 'Date', accessor: 'create_time', colorClass: 'bg-orange-500 text-orange-100' },
      { Header: 'Amount', accessor: 'amount', colorClass: 'bg-blue-500 text-blue-100' },
      { Header: 'Comment', accessor: 'comments', colorClass: 'bg-green-500 text-green-100' },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <table
      {...getTableProps()}
      className="min-w-full divide-y divide-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
    >
      <thead className="bg-gray-800 dark:bg-gray-600">
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                {...column.getHeaderProps()}
                style={{
                  textAlign: 'center',
                }}
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${column.colorClass} dark:${column.colorClass}`}
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
        {rows.map((row, rowIndex) => {
          prepareRow(row);
          return (
            <tr
              {...row.getRowProps()}
              className={rowIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}
            >
              {row.cells.map((cell, cellIndex) => (
                <td
                  {...cell.getCellProps()}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-center ${cellIndex === 0 ? 'font-medium' : ''} text-gray-900 dark:text-gray-300`}
                >
                  {cell.render('Cell')}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}