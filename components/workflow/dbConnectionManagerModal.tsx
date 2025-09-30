import React, { useEffect, useState } from "react";
import * as constants from "@/components/core/constants";
import RequestServer from "@/components/core/client/requestServer";
import Loading from "@/components/core/client/loading";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import * as userInfo from "@/components/core/client/frames/userInfo";

export interface DBConnectionInfo {
  id: string;
  name: string;
  type: "postgres" | "mysql" | "mssql" | "oracle";
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
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
  const defaultPorts: Record<string, number> = {
    postgres: 5432,
    mysql: 3306,
    mssql: 1433,
    oracle: 1521,
  };

  useEffect(() => {
    if (open) loadConnections();
  }, [open]);

  useEffect(() => {
    if (editing) {
      const defaultPort = defaultPorts[editing.type];
      if (defaultPort && editing.port != defaultPort) {
        setEditing({
          ...editing,
          port: defaultPort,
        });
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

      setLoading(true); // 데이터 로딩 시작
      const jResponse = await RequestServer(jRequest);
      setLoading(false); // 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        setConnections(jResponse.connections);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal((error as Error).message);
      console.error(
        `message:${(error as Error).message}\n stack:${
          (error as Error).stack
        }\n`
      );
    }
  };
  const handleSave = async () => {
    if (!editing) return;
    try {
      const commandName = editing.id
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
          id: jResponse.connection?.id || editing.id,
        };
        setEditing(savedConnection);
        alert(`${editing.name} 저장 완료`);
        setEditing(null);
        loadConnections();
      } else {
        alert("저장 실패: " + jResponse.error_message);
      }
    } catch (error) {
      const err = error as Error;
      alert("저장 실패: " + err.message);
      console.error(`message:${err.message}\n stack:${err.stack}\n`);
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
      const err = error as Error;
      alert("삭제 실패: " + err.message);
      console.error(`message:${err.message}\n stack:${err.stack}\n`);
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
      const err = error as Error;
      alert("테스트 실패: " + err.message);
      console.error(`message:${err.message}\n stack:${err.stack}\n`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <BrunnerMessageBox />
      {loading && <Loading />}
      <div
        className={`fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50 ${
          open ? "" : "hidden"
        }`}
      >
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🗄 DB 연결정보 관리
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              닫기
            </button>
          </div>

          <button
            onClick={() =>
              setEditing({
                id: "",
                name: "",
                type: "postgres",
                host: "",
                port: 5432,
                username: "",
                password: "",
                database: "",
              })
            }
            className="mb-4 w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            ➕ 새 연결 추가
          </button>

          <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="flex justify-between items-center border p-2 rounded hover:bg-gray-100 transition"
              >
                <div>
                  <div className="font-medium">{conn.name}</div>
                  <div className="text-sm text-gray-500">
                    {conn.type.toUpperCase()} — {conn.host}:{conn.port}/
                    {conn.database}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTest(conn)}
                    disabled={testing}
                    className="px-2 py-1 rounded border hover:bg-gray-50"
                  >
                    🔄 테스트
                  </button>
                  <button
                    onClick={() => setEditing(conn)}
                    className="px-2 py-1 rounded border hover:bg-gray-50"
                  >
                    ✏️ 수정
                  </button>
                  <button
                    onClick={() => handleDelete(conn.id)}
                    className="px-2 py-1 rounded border hover:bg-red-100 text-red-600"
                  >
                    🗑 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editing && (
            <div className="border-t pt-4 space-y-3">
              <div>
                <label className="block font-medium text-sm mb-1">이름</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              <div>
                <label className="block font-medium text-sm mb-1">
                  DB 종류
                </label>
                <select
                  value={editing.type}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      type: e.target.value as DBConnectionInfo["type"],
                    })
                  }
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="postgres">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="mssql">MSSQL</option>
                  <option value="oracle">Oracle</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-sm mb-1">Host</label>
                <input
                  type="text"
                  value={editing.host}
                  onChange={(e) =>
                    setEditing({ ...editing, host: e.target.value })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              <div>
                <label className="block font-medium text-sm mb-1">Port</label>
                <input
                  type="number"
                  value={editing.port}
                  onChange={(e) =>
                    setEditing({ ...editing, port: Number(e.target.value) })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              <div>
                <label className="block font-medium text-sm mb-1">User</label>
                <input
                  type="text"
                  value={editing.username}
                  onChange={(e) =>
                    setEditing({ ...editing, username: e.target.value })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              <div>
                <label className="block font-medium text-sm mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={editing.password}
                  onChange={(e) =>
                    setEditing({ ...editing, password: e.target.value })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

              <div>
                <label className="block font-medium text-sm mb-1">
                  Database
                </label>
                <input
                  type="text"
                  value={editing.database}
                  onChange={(e) =>
                    setEditing({ ...editing, database: e.target.value })
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>

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
      </div>
    </>
  );
};
