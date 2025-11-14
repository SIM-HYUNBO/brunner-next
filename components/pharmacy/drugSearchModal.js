import React, { useState, useRef } from "react";
import { RequestServer } from "@/components/core/client/requestServer";
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import Loading from "@/components/core/client/loading";
import { useModal } from "@/components/core/client/brunnerMessageBox";

export default function DrugSearchModal({ isOpen, onClose, onSelect }) {
  const { BrunnerMessageBox, openModal } = useModal();
  const [searchTerm, setSearchTerm] = useState(constants.General.EmptyString);
  const [searchType, setSearchType] = useState("name");
  const [selectedRow, setSelectedRow] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const orderQtyRef = useRef(1);
  const [loading, setLoading] = useState(false);

  const searchDrug = async (searchType, searchTerm) => {
    const jRequest = {
      commandName: constants.commands.PHARMACY_SEARCH_DRUG,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      searchType: searchType,
      searchTerm: searchTerm,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      setFilteredData(jResponse.data.rows);
      openModal(jResponse.error_message);
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {loading && <Loading />}
      <BrunnerMessageBox />

      <div className="bg-white rounded-lg shadow-lg w-[800px] p-6">
        <h2 className="text-xl font-semibold mb-4">약품 검색</h2>

        {/* 검색 조건 */}
        <div className="flex space-x-2 mb-4">
          <select
            className="border rounded p-2"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="name">Product Name</option>
            <option value="code">Product Code</option>
            <option value="company">Company Name</option>
          </select>
          <input
            className="flex-1 border rounded p-2"
            type="text"
            placeholder="검색어 입력"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => {
              searchDrug(searchType, searchTerm);
            }}
            className={`px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600`}
          >
            검색
          </button>
        </div>

        {/* 테이블 */}
        <div className="border rounded max-h-64 overflow-y-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">Product Code</th>
                <th className="p-2 text-left">Product Name</th>
                <th className="p-2 text-left">Company Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr
                  key={row.item_seq}
                  onClick={() => setSelectedRow(row)}
                  className={`cursor-pointer hover:bg-blue-100 ${
                    selectedRow?.item_seq === row.item_seq
                      ? "bg-blue-200"
                      : constants.General.EmptyString
                  }`}
                >
                  <td className="p-2 border-b">{row.edi_code}</td>
                  <td className="p-2 border-b">{row.item_name}</td>
                  <td className="p-2 border-b">{row.entp_name}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-2 text-center text-gray-400">
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <label
            htmlFor="systemCode"
            className="leading-7 text-sm text-gray-400"
          >
            Order Qty
          </label>
          <input
            ref={orderQtyRef}
            type="number"
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          />
        </div>
        {/* 버튼 */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            닫기
          </button>
          <button
            disabled={!selectedRow}
            onClick={() => {
              if (selectedRow) onSelect(selectedRow, orderQtyRef.current.value);
              onClose();
            }}
            className={`px-4 py-2 rounded text-white ${
              selectedRow
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
