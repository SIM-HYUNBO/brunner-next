import React, { useEffect, useState, useRef } from "react";
import { Rnd } from "react-rnd";
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { RequestServer } from "@/components/core/client/requestServer";
import Loading from "@/components/core/client/loading";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { Input, Button, Table, Select } from "antd";

export interface DBConnectionInfo {
  system_code: string;
  id: string;
  name: string;
  type: "postgres" | "mysql" | "mssql" | "oracle";
  host: string;
  port: number;
  username: string;
  password: string;
  database_name: string;
}

interface DBConnectionManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DBConnectionManagerModal: React.FC<
  DBConnectionManagerModalProps
> = ({ open, onOpenChange }) => {
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal, openInputModal } = useModal();
  const [connections, setConnections] = useState<DBConnectionInfo[]>([]);
  const [editing, setEditing] = useState<DBConnectionInfo | null>(null);
  const [testing, setTesting] = useState(false);
  const editingRef = useRef<DBConnectionInfo | null>(null);

  const defaultPorts: Record<string, number> = {
    postgres: 5432,
    mysql: 3306,
    mssql: 1433,
    oracle: 1521,
  };

  const [modalSize, setModalSize] = useState({ width: 900, height: 600 });
  const [modalPosition, setModalPosition] = useState({
    x: 0 / 2,
    y: 0 / 2,
  });

  useEffect(() => {
    if (open) loadConnections();

    setModalPosition({
      x: (window?.innerWidth - modalSize.width) / 2,
      y: (window?.innerHeight - modalSize.height) / 2,
    });
  }, [open]);

  useEffect(() => {
    if (editing) {
      const defaultPort = defaultPorts[editing.type];
      if (defaultPort && editing.port !== defaultPort) {
        setEditing({ ...editing, port: defaultPort });
      }
    }
  }, [editing?.type]);

  const loadConnections = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.WORKFLOW_SELECT_DB_CONNECTIONS_ALL,
        systemCode: userInfo.getCurrentSystemCode(),
        userId: userInfo.getLoginUserId(),
      };

      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);

      if (jResponse.error_code === 0) {
        setConnections(jResponse.connections);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (e) {
      setLoading(false);
      openModal((e as Error).message);
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      const commandName =
        editingRef.current?.id || editing.id
          ? constants.commands.WORKFLOW_UPDATE_DB_CONNECTION_ONE
          : constants.commands.WORKFLOW_INSERT_DB_CONNECTION_ONE;

      const jRequest = {
        commandName,
        connection: editing,
      };

      const jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0) {
        const savedConnection: DBConnectionInfo = {
          ...editing,
          id: jResponse?.id || editingRef.current?.id || editing.id,
        };
        editingRef.current = savedConnection;
        setEditing(savedConnection);
        alert(`${editingRef.current.name} 저장 완료`);
        loadConnections();
      } else {
        alert("저장 실패: " + jResponse.error_message);
      }
    } catch (e) {
      alert("저장 실패: " + (e as Error).message);
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 연결정보를 삭제할까요?")) return;
    try {
      const jRequest = {
        commandName: constants.commands.WORKFLOW_DELETE_DB_CONNECTION_ONE,
        systemCode: userInfo.getCurrentSystemCode(),
        id,
      };

      const jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0) {
        alert("삭제 완료");
        loadConnections();
      } else {
        alert("삭제 실패: " + jResponse.error_message);
      }
    } catch (e) {
      alert("삭제 실패: " + (e as Error).message);
      console.error(e);
    }
  };

  const handleTest = async (conn: DBConnectionInfo) => {
    try {
      setTesting(true);
      const jRequest = {
        commandName: constants.commands.WORKFLOW_TEST_DB_CONNECTION,
        connection: conn,
      };

      const jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0) {
        alert("연결 성공");
      } else {
        alert("연결 실패: " + jResponse.error_message);
      }
    } catch (e) {
      alert("테스트 실패: " + (e as Error).message);
      console.error(e);
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <BrunnerMessageBox />
      {loading && <Loading />}

      {open && (
        <div className="fixed inset-0 flex justify-center items-start z-50 bg-black/30 backdrop-blur-sm">
          <Rnd
            size={{ width: modalSize.width, height: modalSize.height }}
            position={{ x: modalPosition.x, y: modalPosition.y }}
            onDragStop={(e, d) => setModalPosition({ x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) => {
              setModalSize({
                width: parseInt(ref.style.width, 10),
                height: parseInt(ref.style.height, 10),
              });
              setModalPosition(position);
            }}
            minWidth={500}
            minHeight={400}
            bounds="window"
            dragHandleClassName="modal-drag-handle"
            className="semi-text-bg-color rounded-lg shadow-lg flex flex-col overflow-hidden"
          >
            {/* 헤더 */}
            <div
              className="medium-text-bg-color 
                            flex 
                            flex-row
                            justify-between 
                            items-center 
                            border-b 
                            cursor-move 
                            modal-drag-handle"
            >
              <h3 className="text-lg font flex items-center gap-2 my">
                🗄 DB Connection Info
              </h3>
              {/* 푸터 */}
              <div className="fixed bottom-0 left-0 right-0 flex justify-end border semi-text-bg-color m-1">
                <Button
                  onClick={() => onOpenChange(false)}
                  className="px-2 py-1 rounded medium-text-bg-color"
                >
                  Close
                </Button>
              </div>
            </div>

            {/* 본문 */}
            <div className="p-4 overflow-y-auto flex-1 h-full">
              <Button
                onClick={() =>
                  setEditing({
                    system_code: `${userInfo.getCurrentSystemCode()}`,
                    id: constants.General.EmptyString,
                    name: constants.General.EmptyString,
                    type: "postgres",
                    host: constants.General.EmptyString,
                    port: 5432,
                    username: constants.General.EmptyString,
                    password: constants.General.EmptyString,
                    database_name: constants.General.EmptyString,
                  })
                }
                className="medium-text-bg-color border mb-4 w-full py-2 rounded"
              >
                ➕ New
              </Button>
              {/* 푸터 */}
              <div className="fixed bottom-0 left-0 right-0 flex justify-end border semi-text-bg-color m-1">
                <Button
                  onClick={() => onOpenChange(false)}
                  className="px-2 py-1 rounded medium-text-bg-color"
                >
                  Close
                </Button>
              </div>

              {/* 연결 리스트 */}
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="flex flex-row justify-between items-center border p-2 rounded hover:medium-text-bg-color transition gap-2"
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="font-medium truncate">{conn.name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {conn.type.toUpperCase()} — {conn.host}:{conn.port}/
                        {conn.database_name}
                      </div>
                    </div>

                    <div className="flex flex-row flex-wrap gap-2 shrink-0">
                      <Button
                        onClick={() => handleTest(conn)}
                        disabled={testing}
                        className="semi-text-bg-color px-2 py-1 rounded border whitespace-nowrap"
                      >
                        🔄 Test
                      </Button>
                      <Button
                        onClick={() => setEditing(conn)}
                        className="semi-text-bg-color px-2 py-1 rounded border whitespace-nowrap"
                      >
                        ✏️ Change
                      </Button>
                      <Button
                        onClick={() => handleDelete(conn.id)}
                        className="semi-text-bg-color px-2 py-1 rounded border whitespace-nowrap"
                      >
                        🗑 Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 수정/추가 폼 */}
              {editing && (
                <div className="border-t pt-4 space-y-3">
                  {/* DB 종류 선택 */}
                  <div className="flex items-center gap-2 mb-2">
                    <label className="font-medium text-sm w-24">DB Type</label>
                    <Select
                      value={editing.type}
                      onChange={(value) =>
                        setEditing({
                          ...editing,
                          type: value as DBConnectionInfo["type"],
                        })
                      }
                      className="border rounded px-2 py-1 flex-1"
                    >
                      <option value={constants.dbType.postgres}>
                        PostgreSQL
                      </option>
                      <option value={constants.dbType.mysql}>MySQL</option>
                      <option value={constants.dbType.mssql}>MSSQL</option>
                      <option value={constants.dbType.oracle}>Oracle</option>
                    </Select>
                  </div>

                  {/* 입력 필드 */}
                  {[
                    { label: "Name(Alias)", key: "name", type: "text" },
                    { label: "Host", key: "host", type: "text" },
                    { label: "Port", key: "port", type: "number" },
                    { label: "User", key: "username", type: "text" },
                    { label: "Password", key: "password", type: "password" },
                    { label: "Database", key: "database_name", type: "text" },
                  ].map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center gap-2 mb-2"
                    >
                      <label className="font-medium text-sm w-24">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        value={(editing as any)[field.key]}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [field.key]:
                              field.type === "number"
                                ? Number(e.target.value)
                                : e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 flex-1"
                      />
                    </div>
                  ))}

                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      onClick={() => setEditing(null)}
                      className="medium-text-bg-color px-3 py-1 rounded border"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="px-3 py-1 rounded medium-text-bg-color"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Rnd>
        </div>
      )}
    </>
  );
};
