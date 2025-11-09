import React, { useRef, useState, useCallback } from "react";
import BrunnerTable from "@/components/core/client/brunnerTable";
import { RequestServer } from "@/components/core/client/requestServer";
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import Loading from "@/components/core/client/loading";
import { useModal } from "@/components/core/client/brunnerMessageBox";

export default function DailyOrderViewer() {
  const { BrunnerMessageBox, openModal } = useModal();
  const tableRef = useRef();

  // 🔹 조회조건 상태
  const orderDateRef = useRef(""); // 필수
  const [orderDate, setOrderDate] = useState(orderDateRef.current.value);

  const supplierNameRef = useRef(""); // 필수
  const [supplierName, setSupplierName] = useState(
    supplierNameRef.current.value
  );

  const productNameRef = useRef(""); // 필수
  const [productName, setProductName] = useState(productNameRef.current.value);

  const [loading, setLoading] = useState(false);

  /* 조회조건 */
  const FilteringConditions = () => {
    return (
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label className="font-medium mb-1">
            Order Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            ref={orderDateRef}
            className="border rounded p-2"
            // value={orderDate}
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1">Supplier Name</label>
          <input
            type="text"
            ref={supplierNameRef}
            // value={supplierName}
            className="border rounded p-2"
            placeholder="Optional"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium mb-1">Product Name</label>
          <input
            type="text"
            ref={productNameRef}
            // value={productName}
            className="border rounded p-2"
            placeholder="Optional"
          />
        </div>

        <button
          onClick={() => tableRef.current.refreshTableData()}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          조회
        </button>
        {/* <button
          onClick={() => requestAutomaticDailyOrder()}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          자동주문
        </button> */}
      </div>
    );
  };

  // 🔹 서버에서 Daily Order 조회
  const fetchDailyOrders = async () => {
    const formattedOrderDate = orderDateRef.current
      ? orderDateRef.current.value.replace(/-/g, "")
      : "";
    const formattedSupplier = supplierNameRef.current.value?.trim() || null;
    const formattedProduct = productNameRef.current.value?.trim() || null;

    const jRequest = {
      commandName: constants.commands.PHARMACY_VIEW_DAILY_ORDER,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      orderDate: formattedOrderDate,
      supplierName: formattedSupplier,
      productName: formattedProduct,
    };

    const prevOrderDate = orderDateRef.current.value;
    const prevSupplierName = supplierNameRef.current.value;
    const prevProductName = productNameRef.current.value;

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      openModal(jResponse.error_message);

      orderDateRef.current.value = prevOrderDate;
      productNameRef.current.value = prevProductName;
      supplierNameRef.current.value = prevSupplierName;

      return jResponse.data?.rows || [];
    } catch (error) {
      setLoading(false);
      openModal(error.message);
    }
  };

  // 🔹 컬럼 정의
  const columns = [
    { Header: "Order Date", accessor: "upload_hour", type: "text" },
    { Header: "Product Name", accessor: "product_name", type: "text" },
    { Header: "Supplier Name", accessor: "supplier_name", type: "text" },
    { Header: "Order Qty", accessor: "order_qty", type: "number" },
    { Header: "Inventory Qty", accessor: "current_inventory", type: "number" },
  ];

  // 🔹 테이블에서 수정, 삭제 기능 (필요 시 구현)
  const updateTableData = (row) => {
    console.log("업데이트:", row);
    tableRef.current.refreshTableData();
  };

  const deleteTableData = (row) => {
    console.log("삭제:", row);
    tableRef.current.refreshTableData();
  };

  const requestAutomaticDailyOrder = async () => {
    const formattedOrderDate = orderDateRef.current
      ? orderDateRef.current.value.replace(/-/g, "")
      : "";
    const formattedSupplier = supplierNameRef.current.value?.trim() || null;
    const formattedProduct = productNameRef.current.value?.trim() || null;

    const jRequest = {
      commandName: constants.commands.PHARMACY_AUTOMATIC_ORDER,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      orderDate: formattedOrderDate,
      supplierName: formattedSupplier,
      productName: formattedProduct,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      openModal(jResponse.error_message);

      return jResponse.data?.rows || [];
    } catch (error) {
      setLoading(false);
      openModal(error.message);
    }
  };

  return (
    <div className="w-full px-2">
      {loading && <Loading />}
      <BrunnerMessageBox />

      {/* 테이블 */}
      <BrunnerTable
        ref={tableRef}
        tableTitle="Daily Order List"
        FilteringConditions={FilteringConditions}
        columnHeaders={columns}
        fetchTableData={fetchDailyOrders}
        addNewTableData={async (newData) => {
          console.log("새 데이터 추가:", newData);
          tableRef.current.refreshTableData();
        }}
        updateTableData={updateTableData}
        deleteTableData={deleteTableData}
      />
    </div>
  );
}
