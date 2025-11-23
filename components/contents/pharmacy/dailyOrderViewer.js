import React, { useEffect, useRef, useState, useCallback } from "react";
import BrunnerTable from "@/components/core/client/brunnerTable";
import { RequestServer } from "@/components/core/client/requestServer";
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import Loading from "@/components/core/client/loading";
import DrugSearchModal from "@/components/pharmacy/drugSearchModal";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { Input, Button, Select, Table } from "antd";

const FilteringConditions = React.memo(
  ({
    orderDate,
    setOrderDate,
    supplierName,
    setSupplierName,
    supplierList,
    onSearch,
    onOrder,
  }) => {
    return (
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label className="font-medium mb-1">
            Order Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="border rounded p-2"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1">Supplier Name</label>
          <Select
            className="border rounded p-2 w-[200px] h-11"
            value={supplierName}
            onChange={(value) => setSupplierName(value)}
          >
            <option value=""></option>
            {supplierList.map((s) => (
              <option key={s.supplier_name} value={s.supplier_name}>
                {s.supplier_name}
              </option>
            ))}
          </Select>
        </div>

        <Button
          onClick={onSearch}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Search
        </Button>

        <Button
          onClick={onOrder}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Order
        </Button>
      </div>
    );
  }
);

export default function DailyOrderViewer() {
  const { BrunnerMessageBox, openModal } = useModal();
  const tableRef = useRef();
  const [editingRow, setEditingRow] = useState(null);
  const [supplierList, setSupplierList] = useState([]);

  const [orderDate, setOrderDate] = useState("");
  const [supplierName, setSupplierName] = useState("");

  const [loading, setLoading] = useState(false);
  const [showDrugSearchModal, setShowDrugSearchModal] = useState(false);

  const onCloseDrugSearchModal = () => {
    setEditingRow(null);
    setShowDrugSearchModal(false);
  };

  const onSelectDrugSearchModal = async (
    selectedData,
    usedQty,
    inventoryQty
  ) => {
    if (!selectedData?.edi_code || selectedData.edi_code === "") {
      openModal(constants.messages.NO_DATA_SELECTED);
      return;
    }

    if (editingRow) {
      const jRequest = {
        commandName: constants.commands.PHARMACY_DAILY_ORDER_UPDATE_ONE,
        systemCode: userInfo.getCurrentSystemCode(),
        userId: userInfo.getLoginUserId(),
        uploadHour: editingRow.values.upload_hour,
        productCode: editingRow.values.product_code,
        newProductCode: selectedData.edi_code,
        newProductName: selectedData.item_name,
        newusedQty: usedQty,
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

  const columns = [
    {
      Header: "No",
      accessor: "rowNumber",
      type: "number",
      Cell: ({ row }) => row.index + 1, // 0부터 시작하니까 +1
    },
    { Header: "Order Date", accessor: "upload_hour", type: "text" },
    { Header: "Product Code", accessor: "product_code", type: "text" },
    { Header: "Product Name", accessor: "product_name", type: "text" },
    { Header: "Supplier Name", accessor: "supplier_name", type: "text" },
    { Header: "Used Qty", accessor: "used_qty", type: "number" },
    { Header: "Inventory Qty", accessor: "current_inventory", type: "number" },
    { Header: "Order Result", accessor: "order_status", type: "text" },
  ];

  useEffect(() => {
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

  const fetchTableData = async () => {
    const jRequest = {
      commandName: constants.commands.PHARMACY_VIEW_DAILY_ORDER,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      orderDate: orderDate.replace(/-/g, "") || "",
      supplierName: supplierName?.trim() || null,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      if (jResponse?.error_message) openModal(jResponse.error_message);
      return jResponse.data?.rows || [];
    } catch (e) {
      setLoading(false);
      openModal(e.message);
    }
  };

  const editRowData = (row) => {
    setEditingRow(row);
    setShowDrugSearchModal(true);
  };

  const orderByRow = async (row) => {
    await requestOrderByRow(row);
    tableRef.current.refreshTableData();
  };

  const requestAutomaticDailyOrder = async () => {
    const jRequest = {
      commandName: constants.commands.PHARMACY_AUTOMATIC_ORDER,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      orderDate: orderDate.replace(/-/g, "") || "",
      supplierName: supplierName?.trim() || null,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      if (jResponse?.error_message) openModal(jResponse.error_message);
      return jResponse.data?.rows || [];
    } catch (e) {
      setLoading(false);
      openModal(e.message);
    }
  };

  const requestOrderByRow = async (row) => {
    const jRequest = {
      commandName: constants.commands.PHARMACY_AUTOMATIC_ORDER,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      orderDate: row.values.upload_hour,
      supplierName: row.values.supplier_name?.trim() || null,
      productName: row.values.product_name?.trim() || null,
      productCode: row.values.product_code,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      if (jResponse?.error_message) openModal(jResponse.error_message);
      return jResponse.data?.rows || [];
    } catch (e) {
      setLoading(false);
      openModal(e.message);
    }
  };

  const filteringConditions = useCallback(
    () => (
      <FilteringConditions
        orderDate={orderDate}
        setOrderDate={setOrderDate}
        supplierName={supplierName}
        setSupplierName={setSupplierName}
        supplierList={supplierList}
        onSearch={() => tableRef.current.refreshTableData()}
        onOrder={async () => {
          await requestAutomaticDailyOrder();
          tableRef.current.refreshTableData();
        }}
      />
    ),
    [orderDate, supplierName, supplierList]
  );

  return (
    <div className="w-full px-2">
      {loading && <Loading />}
      <BrunnerMessageBox />

      {showDrugSearchModal && (
        <DrugSearchModal
          isOpen={showDrugSearchModal}
          onClose={onCloseDrugSearchModal}
          onSelect={onSelectDrugSearchModal}
          initialSearchType="code" // code, name, company 중 code로 초기 검색
          initialSearchTerm={editingRow ? editingRow.values.product_code : ""}
          initialUsedQty={editingRow ? editingRow.values.used_qty : 0}
          initialInventoryQty={
            editingRow ? editingRow.values.current_inventory : 0
          }
        />
      )}

      <BrunnerTable
        ref={tableRef}
        tableTitle="Daily Order List"
        FilteringConditions={filteringConditions} // 함수형으로 전달
        columnHeaders={columns}
        fetchTableDataHandler={fetchTableData}
        editRowDataHandler={editRowData}
        actionRowDataHandler={orderByRow}
        actionTitle="Order"
      />
    </div>
  );
}
