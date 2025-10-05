import React, { useEffect, useState, useRef } from "react";
import { Modal, Table, Input, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import CodeMirror from "@uiw/react-codemirror";
import { sql as sqlLang } from "@codemirror/lang-sql";
import type { SqlParam, SqlNodeData } from "./types/sql";
import Draggable from "react-draggable";

interface SqlEditorModalProps {
  open: boolean;
  initialDbConnectionId?: string;
  initialSqlStmt?: string;
  initialParams?: SqlParam[];
  initialMaxRows?: number;
  onOk: (result: SqlNodeData) => void;
  onCancel: () => void;
}

export const SqlEditorModal: React.FC<SqlEditorModalProps> = ({
  open,
  initialDbConnectionId = "",
  initialSqlStmt = "",
  initialParams = [],
  initialMaxRows,
  onOk,
  onCancel,
}) => {
  const [sqlStmt, setSqlStmt] = useState(initialSqlStmt);
  const [params, setParams] = useState<SqlParam[]>(initialParams);
  const [maxRows, setMaxRows] = useState<number | undefined>(initialMaxRows);
  const [dbConnectionId, setDbConnectionId] = useState<string>(
    initialDbConnectionId
  );

  const dragRef = useRef<HTMLDivElement>(null!);
  const [disabled, setDisabled] = useState(false);

  // SQL에서 @param 자동 추출
  useEffect(() => {
    const matches = sqlStmt.match(/@\w+/g) || [];
    const names = Array.from(new Set(matches.map((m) => m.slice(1))));
    setParams((prev) => {
      const map = new Map(prev.map((p) => [p.name, p]));
      return names.map((name) => map.get(name) ?? { name, type: "string" });
    });
  }, [sqlStmt]);

  // 초기값 적용
  useEffect(() => {
    setSqlStmt(initialSqlStmt);
    setParams(initialParams);
    setMaxRows(initialMaxRows);
    setDbConnectionId(initialDbConnectionId);
  }, [initialSqlStmt, initialParams, initialMaxRows, initialDbConnectionId]);

  const columns: ColumnsType<SqlParam> = [
    { title: "파라미터", dataIndex: "name", key: "name" },
    {
      title: "타입",
      dataIndex: "type",
      key: "type",
      render: (_, record, idx) => (
        <Select
          value={record.type ?? null}
          style={{ width: 120 }}
          onChange={(val) =>
            setParams((prev) => {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], type: val ?? undefined };
              return copy;
            })
          }
          options={[
            { label: "string", value: "string" },
            { label: "number", value: "number" },
            { label: "boolean", value: "boolean" },
            { label: "object", value: "object" },
          ]}
        />
      ),
    },
    {
      title: "바인딩",
      dataIndex: "binding",
      key: "binding",
      render: (_, record, idx) => (
        <Input
          value={record.binding ?? ""}
          placeholder="예: input.userId"
          onChange={(e) =>
            setParams((prev) => {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], binding: e.target.value };
              return copy;
            })
          }
        />
      ),
    },
  ];

  return (
    <Draggable disabled={disabled} handle=".ant-modal-header" nodeRef={dragRef}>
      <div ref={dragRef}>
        <Modal
          open={open}
          onCancel={onCancel}
          title="SQL 편집 및 파라미터 바인딩"
          width={840}
          modalRender={(modal) => modal}
          destroyOnClose
          maskClosable={false}
        >
          {/* DB 연결 ID 입력 */}
          <div style={{ marginBottom: 12 }}>
            <label>
              DB 연결 ID:{" "}
              <Input
                value={dbConnectionId}
                onChange={(e) => setDbConnectionId(e.target.value)}
                placeholder="예: myDbConnectionId"
                style={{ width: 200 }}
              />
            </label>
          </div>

          {/* maxRows 입력 */}
          <div style={{ marginBottom: 12 }}>
            <label>
              최대 조회 행 수 (0 또는 비우면 무제한):{" "}
              <Input
                type="number"
                min={0}
                value={maxRows ?? 0}
                onChange={(e) =>
                  setMaxRows(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                style={{ width: 120 }}
              />
            </label>
          </div>

          {/* CodeMirror SQL 편집 */}
          <div style={{ marginBottom: 12 }}>
            <CodeMirror
              value={sqlStmt}
              height="260px"
              extensions={[sqlLang()]}
              onChange={(value: string) => setSqlStmt(value)}
              placeholder="SELECT * FROM users WHERE id = @userId;"
            />
          </div>

          {/* 파라미터 테이블 */}
          <Table<SqlParam>
            rowKey="name"
            dataSource={params}
            columns={columns}
            pagination={false}
            size="small"
          />

          {/* 저장 버튼 */}
          <div style={{ marginTop: 12, textAlign: "right" }}>
            <button
              onClick={() =>
                onOk({
                  dbConnectionId,
                  sqlStmt,
                  sqlParams: params,
                  maxRows: maxRows && maxRows > 0 ? maxRows : undefined, // 0 또는 비우면 무제한
                })
              }
            >
              저장
            </button>
          </div>
        </Modal>
      </div>
    </Draggable>
  );
};
