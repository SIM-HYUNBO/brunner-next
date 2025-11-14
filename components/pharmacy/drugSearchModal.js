import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import { RequestServer } from "@/components/core/client/requestServer";
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import Loading from "@/components/core/client/loading";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { Table, Input, Button } from "antd";

export default function DrugSearchModal({ isOpen, onClose, onSelect }) {
  const { BrunnerMessageBox, openModal } = useModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [selectedRow, setSelectedRow] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const orderQtyRef = useRef(1);
  const [loading, setLoading] = useState(false);

  // 모달 크기
  const [modalHeight, setModalHeight] = useState(500);
  const [modalWidth, setModalWidth] = useState(800);

  // 컬럼 폭 상태
  const [columnsWidth, setColumnsWidth] = useState([200, 300, 300]);

  const searchDrug = async (searchType, searchTerm) => {
    if (searchTerm.trim().length === 0) {
      openModal(`${constants.messages.REQUIRED_FIELD} [key-word]`);
      return;
    }
    const jRequest = {
      commandName: constants.commands.PHARMACY_SEARCH_DRUG,
      systemCode: userInfo.getCurrentSystemCode(),
      userId: userInfo.getLoginUserId(),
      searchType,
      searchTerm,
    };

    try {
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);
      setFilteredData(jResponse.data.rows || []);
      if (jResponse.error_message) openModal(jResponse.error_message);
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}`);
    }
  };

  if (!isOpen) return null;

  const bottomAreaHeight = 80; // Order Qty + 버튼 영역
  const headerSearchHeight = 100; // 헤더 + 검색 영역
  const tableHeight = modalHeight - bottomAreaHeight * 3 - headerSearchHeight;

  const handleResize = (index, e, { size }) => {
    const newCols = [...columnsWidth];
    newCols[index] = size.width;
    setColumnsWidth(newCols);
  };

  // 화면 가운데 초기 위치
  const initialX = window.innerWidth / 2 - modalWidth / 2;
  const initialY = window.innerHeight / 2 - modalHeight / 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {loading && <Loading />}
      <BrunnerMessageBox />

      <Rnd
        default={{
          x: initialX,
          y: initialY,
          width: modalWidth,
          height: modalHeight,
        }}
        minWidth={400}
        minHeight={300}
        bounds="window"
        className="bg-white rounded-lg shadow-lg flex flex-col border relative"
        dragHandleClassName="drag-handle"
        onResize={(e, direction, ref) => {
          setModalHeight(ref.offsetHeight);
          setModalWidth(ref.offsetWidth);
        }}
      >
        {/* 헤더 */}
        <div className="drag-handle cursor-move p-4 bg-gray-100 rounded-t-lg border-b flex-shrink-0 semi-text-bg-color">
          <h2 className="text-xl font-semibold">약품 검색</h2>
        </div>

        {/* 검색 */}
        <div className="flex space-x-2 p-6 pb-2 flex-shrink-0">
          <select
            className="border rounded p-2"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="name">Product Name</option>
            <option value="code">Product Code</option>
            <option value="company">Company Name</option>
          </select>
          <Input
            className="flex-1"
            placeholder="검색어 입력"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            type="primary"
            onClick={() => searchDrug(searchType, searchTerm)}
          >
            검색
          </Button>
        </div>

        {/* 테이블 */}
        <div className="flex-1 px-6 overflow-hidden">
          <Table
            columns={[
              {
                title: "Product Code",
                dataIndex: "edi_code",
                width: columnsWidth[0],
                onHeaderCell: (_, idx = 0) => ({
                  width: columnsWidth[0],
                  onResize: (e, data) => handleResize(0, e, data),
                }),
              },
              {
                title: "Product Name",
                dataIndex: "item_name",
                width: columnsWidth[1],
                onHeaderCell: (_, idx = 1) => ({
                  width: columnsWidth[1],
                  onResize: (e, data) => handleResize(1, e, data),
                }),
              },
              {
                title: "Company Name",
                dataIndex: "entp_name",
                width: columnsWidth[2],
                onHeaderCell: (_, idx = 2) => ({
                  width: columnsWidth[2],
                  onResize: (e, data) => handleResize(2, e, data),
                }),
              },
            ]}
            dataSource={filteredData}
            rowKey="item_seq"
            pagination={false}
            scroll={{ y: tableHeight }}
            onRow={(row) => ({
              onClick: () => setSelectedRow(row),
              className:
                selectedRow?.item_seq === row.item_seq ? "bg-blue-200" : "",
            })}
          />
        </div>

        {/* Order Qty */}
        <div className="absolute left-0 w-full bottom-16 p-4 flex justify-end space-x-2 bg-gray-50 border-t">
          <label className="leading-7 text-sm text-gray-400">Order Qty</label>
          <input
            ref={orderQtyRef}
            type="number"
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            defaultValue={1}
          />
        </div>

        {/* 버튼 */}
        <div className="absolute bottom-0 left-0 w-full p-4 flex justify-end space-x-2 bg-gray-50 border-t">
          <Button
            onClick={() => {
              onSelect(null);
              onClose();
            }}
          >
            닫기
          </Button>
          <Button
            disabled={!selectedRow}
            type="primary"
            onClick={() => {
              if (selectedRow) onSelect(selectedRow, orderQtyRef.current.value);
              onClose();
            }}
          >
            확인
          </Button>
        </div>
      </Rnd>
    </div>
  );
}
