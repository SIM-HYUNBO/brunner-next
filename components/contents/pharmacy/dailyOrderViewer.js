import React, { useEffect, useRef, useState, useCallback } from "react";
import BrunnerTable from "@/components/core/client/brunnerTable";
import { RequestServer } from "@/components/core/client/requestServer";
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import Loading from "@/components/core/client/loading";
import DrugSearchModal from "@/components/pharmacy/drugSearchModal";
import { useModal } from "@/components/core/client/brunnerMessageBox";

export default function DailyOrderViewer() {
  const { BrunnerMessageBox, openModal } = useModal();
  const tableRef = useRef();
  const [editingRow, setEditingRow] = useState(null);

  const [supplierList, setSupplierList] = useState([]);

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

  const [showDrugSearchModal, setShowDrugSearchModal] = useState(false);

  const onCloseDrugSearchModal = () => {
    setEditingRow(null);
    setShowDrugSearchModal(false);
  };

  const onSelectDrugSearchModal = async (selectedData, orderQty) => {
    if (!selectedData?.edi_code || selectedData?.edi_code == "") {
      selectedData = null;
      openModal(constants.messages.INVALID_DATA_SELECTED);
      return;
    }

    // 행 데이터 수정
    if (editingRow) {
      const jRequest = {
        commandName: constants.commands.PHARMACY_DAILY_ORDER_UPDATE_ONE,
        systemCode: userInfo.getCurrentSystemCode(),
        userId: userInfo.getLoginUserId(),
        uploadHour: editingRow.values.upload_hour,
        productCode: editingRow.values.product_code,
        newProductCode: selectedData.edi_code,
        newProductName: selectedData.item_name,
        newOrderQty: orderQty,
      };

      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);

      if (jResponse && jResponse.error_message) {
        openModal(jResponse.error_message);
        tableRef.current.refreshTableData();
      }
    }
  };

  // 🔹 컬럼 정의
  const columns = [
    { Header: "Order Date", accessor: "upload_hour", type: "text" },
    { Header: "Product Code", accessor: "product_code", type: "text" },
    { Header: "Product Name", accessor: "product_name", type: "text" },
    { Header: "Supplier Name", accessor: "supplier_name", type: "text" },
    { Header: "Order Qty", accessor: "order_qty", type: "number" },
    { Header: "Inventory Qty", accessor: "current_inventory", type: "number" },
    { Header: "Order Result", accessor: "order_status", type: "text" },
  ];

  useEffect(() => {
    // 🔹 공급처 목록 불러오기
    const fetchSuppliers = async () => {
      const jRequest = {
        commandName: constants.commands.PHARMACY_USER_SUPPLIER_SELECT_ALL,
        systemCode: userInfo.getCurrentSystemCode(),
        userId: userInfo.getLoginUserId(),
      };

      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);

      if (jResponse && jResponse.data) {
        setSupplierList(jResponse.data.rows);
      }
    };
    fetchSuppliers();
  }, []);

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
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1">Supplier Name</label>
          <select
            ref={supplierNameRef}
            className="border rounded p-2 w-[200px]"
            defaultValue=""
          >
            <option value={supplierName}></option>
            {supplierList.map((s) => (
              <option key={s.supplier_name} value={s.supplier_name}>
                {s.supplier_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1">Product Name</label>
          <input
            type="text"
            ref={productNameRef}
            className="border rounded p-2"
            placeholder="Optional"
          />
        </div>

        <button
          onClick={() => tableRef.current.refreshTableData()}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Search
        </button>
        <button
          onClick={() => requestAutomaticDailyOrder()}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Order
        </button>
      </div>
    );
  };

  // 🔹 서버에서 Daily Order 조회
  const fetchTableData = async () => {
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

  const addNewRowData = async (newData) => {
    console.log("새 데이터 추가:", newData);
    tableRef.current.refreshTableData();
  };

  // ✅ editRowData 클릭 시 검색 모달창 표시
  const editRowData = async (row) => {
    setEditingRow(row);
    setShowDrugSearchModal(true);
  };

  const orderByRow = (row) => {
    console.log("Order:", row);
    requestOrderByRow(row);
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

  const requestOrderByRow = async (row) => {
    const formattedOrderDate = row.values.upload_hour;
    const formattedSupplier = row.values.supplier_name?.trim() || null;
    const formattedProduct = row.values.product_name?.trim() || null;
    const productCode = row.values.product_code;

    const jRequest = {
      commandName: constants.commands.PHARMACY_AUTOMATIC_ORDER,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      orderDate: formattedOrderDate,
      supplierName: formattedSupplier,
      productName: formattedProduct,
      productCode: productCode,
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

      {showDrugSearchModal && (
        <DrugSearchModal
          isOpen={showDrugSearchModal}
          onClose={onCloseDrugSearchModal}
          onSelect={onSelectDrugSearchModal}
        />
      )}

      {/* 테이블 */}
      <BrunnerTable
        ref={tableRef}
        tableTitle="Daily Order List"
        FilteringConditions={FilteringConditions}
        columnHeaders={columns}
        fetchTableDataHandler={fetchTableData}
        editRowDataHandler={editRowData}
        actionRowDataHandler={orderByRow}
        actionTitle="Order"
      />
    </div>
  );
}
