import { useState, useEffect, useRef } from "react";
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { RequestServer } from "@/components/core/client/requestServer";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import Loading from "@/components/core/client/loading";
import BrunnerTable from "@/components/core/client/brunnerTable";
import GoverningMessage from "@/components/core/client/governingMessage";

const SupplierSettingContent = () => {
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal, openInputModal } = useModal();

  const tableRef = useRef();
  const [userId, setUserId] = useState(constants.General.EmptyString);
  const [supplierName, setSupplierName] = useState(
    constants.General.EmptyString
  );
  const [supplierParams, setSupplierParams] = useState({
    url: constants.General.EmptyString,
    id: constants.General.EmptyString,
    pw: constants.General.EmptyString,
  });
  const [useFlag, setUseFlag] = useState(true);
  const [supplierList, setSupplierList] = useState([]);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // 공급처 목록 불러오기
  useEffect(() => {
    fetchTableData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      user_id: userId,
      supplier_name: supplierName,
      supplier_params: supplierParams,
      use_flag: useFlag,
    };

    if (editingSupplier) {
      // 수정
      try {
        await axios.put(`/api/supplier-info/${editingSupplier.id}`, data);
        openModal("수정 완료");
      } catch (e) {
        openModal("수정 실패");
      }
    } else {
      // 생성
      try {
        await axios.post("/api/supplier-info", data);
        openModal("공급처 등록 완료");
      } catch (e) {
        openModal("등록 실패");
      }
    }

    // 폼 초기화
    setUserId(constants.General.EmptyString);
    setSupplierName(constants.General.EmptyString);
    setSupplierParams({
      url: constants.General.EmptyString,
      id: constants.General.EmptyString,
      pw: constants.General.EmptyString,
    });
    setUseFlag(true);
    setEditingSupplier(null);

    // 공급처 목록 새로고침
    // const response = await axios.get("/api/supplier-info");
    setSupplierList(response.data);
  };

  const handleEdit = (supplier) => {
    setUserId(supplier.user_id);
    setSupplierName(supplier.supplier_name);
    setSupplierParams(supplier.supplier_params);
    setUseFlag(supplier.use_flag);
    setEditingSupplier(supplier);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/supplier-info/${id}`);
      openModal("삭제 완료");
      // 삭제 후 목록 새로고침
      // const response = await axios.get("/api/supplier-info");
      setSupplierList(response.data);
    } catch (e) {
      console.error("Error deleting supplier:", e);
      openModal("삭제 실패");
    }
  };

  const columns = [
    { Header: "Name", accessor: "supplier_name", type: "text" },
    {
      Header: "Parameters",
      accessor: "supplier_params",
      type: "text",
      editable: true,
    },
    {
      Header: "Use Flag",
      accessor: "use_flag",
      type: "checkbox",
      Cell: ({ value }) => <input type="checkbox" checked={!!value} readOnly />,
      editable: true,
    },
  ];

  /* 조회조건 */
  const FilteringConditions = () => {
    return <></>;
  };

  const fetchTableData = async () => {
    const jRequest = {
      commandName: constants.commands.PHARMACY_USER_SUPPLIER_SELECT_ALL,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);

      if (jResponse.error_code !== 0) {
        openModal(jResponse.error_message);
        return [];
      }

      return (jResponse.data?.rows || []).map((row) => ({
        ...row,
        supplier_params: JSON.stringify(row.supplier_params, null, 2),
      }));
    } catch (e) {
      setLoading(false);
      openModal(e.message);
      return [];
    }
  };

  const addNewRowData = async (newData) => {
    // console.log("새 데이터 추가:", newData);
    const supplierName = newData.supplier_name;
    const parameters = newData.supplier_params;
    const useFlag = newData.use_flag;

    const jRequest = {
      commandName: constants.commands.PHARMACY_SUPPLIER_UPSERT_ONE,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      supplierName: supplierName,
      parameters: parameters,
      useFlag: useFlag,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);

      openModal(jResponse.error_message);
    } catch (e) {
      setLoading(false);
      openModal(e.message);
    }

    tableRef.current.refreshTableData();
  };

  const editRowData = async (row) => {
    const supplierName = row.values.supplier_name;
    const parameters = row.values.supplier_params;
    const useFlag = row.values.use_flag;

    const jRequest = {
      commandName: constants.commands.PHARMACY_SUPPLIER_UPSERT_ONE, // 기존 upsert 사용
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      supplierName: supplierName,
      parameters: parameters,
      useFlag: useFlag,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);

      openModal(jResponse.error_message || "수정 완료");
    } catch (e) {
      setLoading(false);
      openModal(e.message);
    }

    // 테이블 새로고침
    tableRef.current.refreshTableData();
  };

  const deleteRowData = async (row) => {
    // console.log("새 데이터 추가:", newData);
    const supplierName = row.values.supplier_name;

    const jRequest = {
      commandName: constants.commands.PHARMACY_SUPPLIER_DELETE_ONE,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      supplierName: supplierName,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);

      openModal(jResponse.error_message);
    } catch (e) {
      setLoading(false);
      openModal(e.message);
    }

    tableRef.current.refreshTableData();
  };

  return (
    <>
      {loading && <Loading />}
      <BrunnerMessageBox />
      <div>
        <div className={`w-full items-start text-left`}>
          <h2 className={`page-title`}>Supplier Setting</h2>
          <GoverningMessage
            governingMessage={"Configure your Supplier here."}
          />

          <BrunnerTable
            ref={tableRef}
            tableTitle="Supplier List"
            FilteringConditions={FilteringConditions}
            columnHeaders={columns}
            fetchTableDataHandler={fetchTableData}
            addNewRowDataHandler={addNewRowData}
            editRowDataHandler={editRowData}
            deleteRowDataHandler={deleteRowData}
          />
        </div>
      </div>
    </>
  );
};

export default SupplierSettingContent;
