import React, { useState } from "react";
import * as XLSX from "xlsx";
import { RequestServer } from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import * as constants from "@/components/core/constants";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import Loading from "@/components/core/client/loading";

export function ExcelUploader() {
  const { BrunnerMessageBox, openModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState([]);

  // 📘 엑셀 읽기
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 📘 엑셀 전체 range 정보
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    const result = [];

    // ✅ 5행부터 끝까지 읽기
    for (let row = 4; row <= range.e.r; row++) {
      const drugNameCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 2 })]; // C열 (index 2)
      const supplierCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 3 })]; // D열 (index 3)
      const orderQtyCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 5 })]; // F열 (index 5)

      const drugName = drugNameCell ? drugNameCell.v : null;
      const supplierName = supplierCell ? supplierCell.v : null;
      const orderQty = orderQtyCell ? orderQtyCell.v : null;

      // ✅ 값이 모두 없으면 skip
      if (!drugName && !supplierName && !orderQty) continue;

      result.push({
        drugName,
        supplierName,
        orderQty,
      });
    }

    // console.log("읽은 데이터:", result);
    setExcelData(result);
  };

  // 📤 서버로 업로드
  const handleUpload = async () => {
    const jRequest = {
      commandName: constants.commands.PHARMACY_UPLOAD_DAILY_ORDER,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      excelData: excelData,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      openModal(jResponse.error_message);
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, width: 400 }}>
      {loading && <Loading />}
      <BrunnerMessageBox />
      <h2>Upload Daily Order</h2>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ marginBottom: 10 }}
      />

      {excelData.length > 0 && (
        <div
          style={{
            background: "#f7f7f7",
            padding: 8,
            marginBottom: 10,
            maxHeight: 150,
            overflow: "auto",
          }}
        >
          <pre>{JSON.stringify(excelData.slice(0, 5), null, 2)}</pre>
        </div>
      )}

      <button onClick={handleUpload}>Save</button>
    </div>
  );
}
