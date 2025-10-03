import React, { useEffect, useState, useRef } from "react";
import * as constants from "@/components/core/constants";
import RequestServer from "@/components/core/client/requestServer";
import Loading from "@/components/core/client/loading";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { Rnd } from "react-rnd";

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
  const { BrunnerMessageBox, openModal } = useModal();
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

  const [modalSize, setModalSize] = useState({ width: 700, height: 600 });
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 100 });

  useEffect(() => {
    if (open) loadConnections();
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
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
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
    } catch (error) {
      setLoading(false);
      openModal((error as Error).message);
      console.error(error);
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
    } catch (error) {
      alert("저장 실패: " + (error as Error).message);
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 연결정보를 삭제할까요?")) return;
    try {
      const jRequest = {
        commandName: constants.commands.WORKFLOW_DELETE_DB_CONNECTION_ONE,
        id,
      };

      const jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0) {
        alert("삭제 완료");
        loadConnections();
      } else {
        alert("삭제 실패: " + jResponse.error_message);
      }
    } catch (error) {
      alert("삭제 실패: " + (error as Error).message);
      console.error(error);
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
    } catch (error) {
      alert("테스트 실패: " + (error as Error).message);
      console.error(error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <BrunnerMessageBox />
      {loading && <Loading />}

      {open && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-50">
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
            className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center p-3 border-b cursor-move modal-drag-handle bg-gray-100">
              <h2 className="text-lg font-bold flex items-center gap-2">
                🗄 DB 연결정보 관리
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                닫기
              </button>
            </div>

            {/* 본문 */}
            <div className="p-4 overflow-y-auto flex-1">
              <button
                onClick={() =>
                  setEditing({
                    system_code: `${process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE}`,
                    id: "",
                    name: "",
                    type: "postgres",
                    host: "",
                    port: 5432,
                    username: "",
                    password: "",
                    database_name: "",
                  })
                }
                className="mb-4 w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                ➕ 새 연결 추가
              </button>

              {/* 연결 리스트 */}
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="flex flex-row justify-between items-center border p-2 rounded hover:bg-gray-100 transition gap-2"
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="font-medium truncate">{conn.name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {conn.type.toUpperCase()} — {conn.host}:{conn.port}/
                        {conn.database_name}
                      </div>
                    </div>

                    <div className="flex flex-row flex-wrap gap-2 shrink-0">
                      <button
                        onClick={() => handleTest(conn)}
                        disabled={testing}
                        className="px-2 py-1 rounded border hover:bg-gray-50 whitespace-nowrap"
                      >
                        🔄 테스트
                      </button>
                      <button
                        onClick={() => setEditing(conn)}
                        className="px-2 py-1 rounded border hover:bg-gray-50 whitespace-nowrap"
                      >
                        ✏️ 수정
                      </button>
                      <button
                        onClick={() => handleDelete(conn.id)}
                        className="px-2 py-1 rounded border hover:bg-red-100 text-red-600 whitespace-nowrap"
                      >
                        🗑 삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 수정/추가 폼 */}
              {editing && (
                <div className="border-t pt-4 space-y-3">
                  {/* DB 종류 선택 */}
                  <div className="flex items-center gap-2 mb-2">
                    <label className="font-medium text-sm w-24">DB 종류</label>
                    <select
                      value={editing.type}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          type: e.target.value as DBConnectionInfo["type"],
                        })
                      }
                      className="border rounded px-2 py-1 flex-1"
                    >
                      <option value="postgres">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="mssql">MSSQL</option>
                      <option value="oracle">Oracle</option>
                    </select>
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
                    <button
                      onClick={() => setEditing(null)}
                      className="px-3 py-1 rounded border hover:bg-gray-100"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      저장
                    </button>
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
