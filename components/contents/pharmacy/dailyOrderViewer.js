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
  const [orderDate, setOrderDate] = useState(""); // 필수
  const supplierNameRef = useRef(""); // 선택
  const productNameRef = useRef(""); // 선택
  const [loading, setLoading] = useState(false);

  // 🔹 서버에서 Daily Order 조회
  const fetchDailyOrders = async () => {
    const formattedOrderDate = orderDate ? orderDate.replace(/-/g, "") : "";
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
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1">Supplier Name</label>
          <input
            type="text"
            ref={supplierNameRef}
            // value={supplierName}
            // onChange={(e) => setSupplierName(e.target.value)}
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
            // onChange={(e) => setProductName(e.target.value)}
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
      </div>
    );
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
