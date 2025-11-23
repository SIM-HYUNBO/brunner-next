import React, { useState } from "react";
import * as XLSX from "xlsx";
import { RequestServer } from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import * as constants from "@/components/core/constants";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import Loading from "@/components/core/client/loading";

export function DailyOrderUploader() {
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

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    const result = [];

    for (let row = 4; row <= range.e.r; row++) {
      const productCodeCell =
        worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      const productNameCell =
        worksheet[XLSX.utils.encode_cell({ r: row, c: 2 })];
      const supplierCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 3 })];
      const currentInventoryCell =
        worksheet[XLSX.utils.encode_cell({ r: row, c: 4 })];
      const usedQtyCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 5 })];

      const productCode = productCodeCell ? productCodeCell.v : null;
      const productName = productNameCell ? productNameCell.v : null;
      const supplierName = supplierCell ? supplierCell.v : null;
      const currentInventory = currentInventoryCell
        ? currentInventoryCell.v
        : null;
      const usedQty = usedQtyCell ? usedQtyCell.v : null;

      if (!productName && !supplierName && !usedQty) continue;

      result.push({
        productCode,
        productName,
        supplierName,
        usedQty,
        currentInventory,
      });
    }

    setExcelData(result);
  };

  // 서버로 10개씩 나눠서 업로드
  const handleUpload = async () => {
    if (!excelData || excelData.length === 0) return;

    const batchSize = 10; // 10개씩 나누기
    const totalBatches = Math.ceil(excelData.length / batchSize);

    setLoading(true);

    try {
      const uploadHour =
        new Date().getFullYear().toString() +
        String(new Date().getMonth() + 1).padStart(2, "0") +
        String(new Date().getDate()).padStart(2, "0") +
        String(new Date().getHours()).padStart(2, "0");

      for (let i = 0; i < totalBatches; i++) {
        const batchData = excelData.slice(i * batchSize, (i + 1) * batchSize);

        const jRequest = {
          commandName: constants.commands.PHARMACY_UPLOAD_DAILY_ORDER,
          systemCode: userInfo.getCurrentSystemCode(),
          userId: userInfo.getLoginUserId(),
          uploadHour: uploadHour,
          excelData: batchData,
        };

        const jResponse = await RequestServer(jRequest);

        // 요청 결과 확인
        if (jResponse.error_code) {
          openModal(`Batch ${i + 1} Failed: ${jResponse.error_message}`);
        }
      }

      openModal(constants.messages.SUCCESS_FINISHED);
    } catch (e) {
      openModal(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-300 p-4 w-96 rounded-lg general-text-bg-color">
      {loading && <Loading />}
      <BrunnerMessageBox />
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="mb-2 file:border file:border-gray-300 file:rounded file:px-3 file:py-1 file:bg-gray-100 file:text-gray-700"
      />

      {excelData.length > 0 && (
        <div className="bg-gray-100 p-2 mb-2 max-h-36 overflow-auto rounded">
          <pre className="text-sm">
            {JSON.stringify(excelData.slice(0, 5), null, 2)}
          </pre>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 semi-text-bg-color"
        >
          Save
        </button>
      </div>
    </div>
  );
}
