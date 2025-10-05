// components/SqlEditorModal.tsx
import React, { useEffect, useState } from "react";
import { Modal, Table, Input, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import CodeMirror from "@uiw/react-codemirror";
import { sql as sqlLang } from "@codemirror/lang-sql";
import type { SqlParam } from "./types/sql";

interface SqlEditorModalProps {
  open: boolean; // antd v5 uses `open`; v4 사용중이면 `visible`로 바꿔주세요.
  initialSql?: string;
  initialParams?: SqlParam[];
  onOk: (result: { sql: string; params: SqlParam[] }) => void;
  onCancel: () => void;
}

export const SqlEditorModal: React.FC<SqlEditorModalProps> = ({
  open,
  initialSql = "",
  initialParams = [],
  onOk,
  onCancel,
}) => {
  const [sqlText, setSqlText] = useState<string>(initialSql);
  const [params, setParams] = useState<SqlParam[]>(initialParams);

  // SQL에서 @param 자동 추출 및 기존 params 보존
  useEffect(() => {
    const matches = sqlText.match(/@\w+/g) || [];
    const names = Array.from(new Set(matches.map((m) => m.slice(1))));
    setParams((prev) => {
      const map = new Map(prev.map((p) => [p.name, p]));
      return names.map(
        (name) => map.get(name) ?? { name, type: "string", binding: "" }
      );
    });
  }, [sqlText]);

  // 초기값 변경 시 동기화
  useEffect(() => {
    setSqlText(initialSql);
    setParams(initialParams);
  }, [initialSql, initialParams]);

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
          onChange={(val) => {
            setParams((prev) => {
              const copy = [...prev];
              copy[idx] = {
                ...copy[idx],
                type: val ?? ("string" as SqlParam["type"]),
              };
              return copy;
            });
          }}
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
          value={record.binding}
          placeholder="예: input.userId 또는 {{input.userId}}"
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
    <Modal
      open={open} // antd v4 사용중이면 visible={open} 로 변경
      title="SQL 편집 및 파라미터 바인딩"
      onCancel={onCancel}
      onOk={() => onOk({ sql: sqlText, params })}
      width={840}
      destroyOnClose
    >
      <div style={{ marginBottom: 12 }}>
        <CodeMirror
          value={sqlText}
          height="260px"
          extensions={[sqlLang()]}
          onChange={(value: string) => setSqlText(value)}
          placeholder="예: SELECT * FROM users WHERE id = @userId;"
        />
      </div>

      <Table<SqlParam>
        rowKey="name"
        dataSource={params}
        columns={columns}
        pagination={false}
        size="small"
      />
    </Modal>
  );
};
