"use strict";

import { useState } from "react";
import { useDeviceType } from "@/components/core/commonFunctions";
import GoverningMessage from "@/components/core/client/governingMessage";
import LottiePlayer from "@/components/core/client/lottiePlayer";
import * as XLSX from "xlsx";
import { FileUploader } from "@/components/core/client/fileUploader";
import DailyOrderViewer from "@/components/contents/pharmacy/dailyOrderViewer";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { RequestServer } from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import * as constants from "@/components/core/constants";
import Loading from "@/components/core/client/loading";

export default function UploadDailyOrderContent() {
  const { isMobile, isTablet } = useDeviceType();

  // 🔹 추가한 state
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 메시지 모달 훅
  const { BrunnerMessageBox, openModal } = useModal();

  // 파일 내용 읽기
  const handleFileChange = async (e) => {
    const excelFile = e.target.files?.[0];
    if (!excelFile) {
      setFileData(null);
      return;
    }

    const data = await excelFile.arrayBuffer();
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
      const safeInventoryQtyCell =
        worksheet[XLSX.utils.encode_cell({ r: row, c: 5 })];

      const productCode = productCodeCell?.v ?? null;
      const productName = productNameCell?.v ?? null;
      const supplierName = supplierCell?.v ?? null;
      const currentInventoryQty = currentInventoryCell?.v ?? null;
      const safeInventoryQty = safeInventoryQtyCell?.v ?? null;

      if (!productName && !supplierName && !safeInventoryQty) continue;

      result.push({
        productCode,
        productName,
        supplierName,
        safeInventoryQty,
        currentInventoryQty,
      });
    }

    setFileData(result);
  };

  // ⬆ 서버 업로드
  const handleFileUpload = async (excelData) => {
    if (!excelData || excelData.length === 0) {
      return openModal("No data to upload");
    }

    const batchSize = 10;
    const totalBatches = Math.ceil(excelData.length / batchSize);
    setLoading(true);

    try {
      const now = new Date();
      const uploadHour =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        String(now.getHours()).padStart(2, "0");

      for (let i = 0; i < totalBatches; i++) {
        const batchData = excelData.slice(i * batchSize, (i + 1) * batchSize);

        const jRequest = {
          commandName: constants.commands.PHARMACY_UPLOAD_DAILY_ORDER,
          systemCode: userInfo.getCurrentSystemCode(),
          userId: userInfo.getLoginUserId(),
          uploadHour,
          excelData: batchData,
        };

        const jResponse = await RequestServer(jRequest);

        if (jResponse.error_code) {
          openModal(
            `Batch ${i + 1} Failed: ${jResponse.error_message || "Unknown"}`
          );
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
    <>
      {loading && <Loading />}
      <BrunnerMessageBox />

      <div className="w-full items-start text-left">
        <h2 className="page-title">Upload Daily Order</h2>
        <GoverningMessage governingMessage="Select daily order file to upload." />

        <div className="flex justify-center mt-5">
          <FileUploader
            onFileChange={handleFileChange}
            onFileUpload={handleFileUpload}
            fileData={fileData}
          />
        </div>

        <div className="flex justify-center mt-5">
          <DailyOrderViewer />
        </div>
      </div>
    </>
  );
}
