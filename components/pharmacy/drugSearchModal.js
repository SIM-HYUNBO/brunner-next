import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import { RequestServer } from "@/components/core/client/requestServer";
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import Loading from "@/components/core/client/loading";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { Table, Input, Button, Select } from "antd";

export default function DrugSearchModal({ isOpen, onClose, onSelect }) {
  const { BrunnerMessageBox, openModal } = useModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [selectedRow, setSelectedRow] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const usedQtyRef = useRef(1);
  const [loading, setLoading] = useState(false);

  const [modalHeight, setModalHeight] = useState(500);
  const [modalWidth, setModalWidth] = useState(800);
  const [columnsWidth, setColumnsWidth] = useState([200, 300, 300]);

  const searchDrug = async (searchType, searchTerm) => {
    if (searchTerm.trim().length < 2) {
      openModal(
        `${constants.messages.REQUIRED_FIELD} [key-word]. more than 2 characters`
      );
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
    } catch (e) {
      setLoading(false);
      openModal(e.message);
      console.error(`message:${e.message}\n stack:${e.stack}`);
    }
  };

  if (!isOpen) return null;

  const bottomAreaHeight = 80; // Used Qty + 버튼 영역
  const headerSearchHeight = 100; // 헤더 + 검색 영역
  const tableHeight = modalHeight - bottomAreaHeight * 3 - headerSearchHeight;

  const handleResize = (index, e, { size }) => {
    const newCols = [...columnsWidth];
    newCols[index] = size.width;
    setColumnsWidth(newCols);
  };

  const initialX = window.innerWidth / 2 - modalWidth / 2;
  const initialY = window.innerHeight / 2 - modalHeight / 2;

  const resizableTitle = (title, idx) => ({
    title: (
      <Resizable
        width={columnsWidth[idx]}
        height={0}
        handle={<span className="react-resizable-handle" />}
        onResize={(e, data) => handleResize(idx, e, data)}
        draggableOpts={{ enableUserSelectHack: false }}
      >
        <div style={{ width: columnsWidth[idx] }}>{title}</div>
      </Resizable>
    ),
  });

  const columns = [
    {
      dataIndex: "edi_code",
      ...resizableTitle("Product Code", 0),
      width: columnsWidth[0],
    },
    {
      dataIndex: "item_name",
      ...resizableTitle("Product Name", 1),
      width: columnsWidth[1],
    },
    {
      dataIndex: "entp_name",
      ...resizableTitle("Company Name", 2),
      width: columnsWidth[2],
    },
  ];

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
          <Select
            className="border rounded p-2"
            value={searchType}
            onChange={(value) => setSearchType(value)}
          >
            <option value="name">Product Name</option>
            <option value="code">Product Code</option>
            <option value="company">Company Name</option>
          </Select>
          <Input
            className="flex-1"
            placeholder="검색어 입력"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchDrug(searchType, searchTerm);
            }}
          />
          <Button
            type="primary"
            onClick={() => searchDrug(searchType, searchTerm)}
          >
            Search
          </Button>
        </div>

        {/* 테이블 */}
        <div className="flex-1 px-6 overflow-hidden">
          <Table
            columns={columns}
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

        {/* Used Qty */}
        <div className="absolute left-0 w-full bottom-16 p-4 flex justify-end space-x-2 border-t">
          <label className="leading-7 text-sm text-gray-400">Used Qty</label>
          <input
            ref={usedQtyRef}
            type="number"
            className="px-4 py-2 rounded general-text-bg-color"
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
              if (selectedRow) onSelect(selectedRow, usedQtyRef.current.value);
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
