`use strict`

import { useState, useEffect, useRef } from 'react'
import React, { useMemo } from 'react';
import { useTable } from "react-table";
import requestServer from './../../../components/requestServer'
import { useRouter } from 'next/router'

var tableData = [];

export default function AssetContent() {
  const router = useRouter();

  useEffect(() => {
    async function asyncRequestGetIncomeHistory() {
      await requestGetIncomeHistory();
    }
    asyncRequestGetIncomeHistory();
  }, []);

  const requestGetIncomeHistory = async () => {
    var jRequest = {};
    var jResponse = null;
    var loginUserId = getLoginUserId();

    if (loginUserId) {
      jRequest.commandName = "asset.getIncomeHistory";
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
      jRequest.userId = loginUserId;

      jResponse = await requestServer('POST', JSON.stringify(jRequest));

      if (jResponse.error_code == 0) {
        tableData = jResponse.incomeHistory;
      } else {
        alert(JSON.stringify(jResponse.error_message));
        tableData = null;
      }
    }
  };

  const getLoginUserId = () => {
    var userInfo = null;

    if (process.env.userInfo) {
      userInfo = process.env.userInfo;
      return userInfo.userId;
    }
    return null;
  }

  return (
    <>
      <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left md:mb-0 items-center text-center">
        <h1 className="title-font 
                       sm:text-4xl 
                       text-3xl 
                       mb-10 
                       font-medium 
                       text-green-900">
          내자산.
        </h1>
        <button
          className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
          onClick={async () => { router.push('/mainPages/asset') }} >
          새로고침
        </button>
        <div className="main-governing-text mt-5">
          내자산은 내가 지킨다. <br />
          시야를 넓혀 최고 수익에 투자하세요.
        </div>
        <Table />
      </div>
      <div className="lg:h-2/6 lg:w-2/6">
        {/* <SupportContentAnimation /> */}
      </div>
    </>
  );
}

// 테이블 컴포넌트
function Table() {

  const columns = useMemo(() => [
    { Header: 'Amount', accessor: 'amount', width: 100 },
    { Header: 'Comment', accessor: 'comments', width: 200 },
    { Header: 'Date', accessor: 'create_time', width: 150 },
  ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: tableData,
  });

  return (
    <table {...getTableProps()} style={{ border: 'solid 1px blue', borderCollapse: 'collapse' }}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th
                {...column.getHeaderProps()}
                style={{
                  textAlign: 'center',
                  borderBottom: 'solid 1px blue',
                  background: 'aliceblue',
                  color: 'black',
                  fontWeight: 'bold',
                }}
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return (
                  <td
                    {...cell.getCellProps()}
                    style={{
                      width: 500,
                      padding: 5,
                      border: 'solid 1px gray',
                      background: 'white',
                      color: 'black'
                    }}
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}