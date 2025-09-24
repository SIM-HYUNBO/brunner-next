import React from "react";

export interface WorkflowVariable {
  nodeId: string; // 변수를 제공한 노드 ID
  key: string; // 변수 이름
  type: string; // 변수 타입
}

interface VariableBrowserProps {
  variables: WorkflowVariable[];
  onSelect: (variable: string) => void; // 선택 시 실행
}

const VariableBrowser: React.FC<VariableBrowserProps> = ({
  variables,
  onSelect,
}) => {
  // 노드별 그룹화
  const grouped = variables.reduce((acc, v) => {
    if (!acc[v.nodeId]) acc[v.nodeId] = [];
    acc[v.nodeId]?.push(v);
    return acc;
  }, {} as Record<string, WorkflowVariable[]>);

  return (
    <div className="border p-3 rounded h-full overflow-auto">
      {" "}
      <h4 className="font-bold mb-2 text-lg">Available Variables</h4>{" "}
      {Object.entries(grouped).length === 0 && (
        <p className="text-gray-500">No variables available.</p>
      )}{" "}
      {Object.entries(grouped).map(([nodeId, vars]) => (
        <div key={nodeId} className="mb-4">
          {" "}
          <div className="font-semibold text-blue-600 mb-1">
            Node: {nodeId}
          </div>{" "}
          <table className="table-auto w-full text-sm border">
            {" "}
            <thead>
              {" "}
              <tr className="bg-gray-100">
                {" "}
                <th className="border px-2 py-1">Key</th>{" "}
                <th className="border px-2 py-1">Type</th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody>
              {" "}
              {vars.map((v, idx) => (
                <tr
                  key={idx}
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => onSelect(`${v.nodeId}.${v.key}`)}
                >
                  {" "}
                  <td className="border px-2 py-1">{v.key}</td>{" "}
                  <td className="border px-2 py-1">{v.type}</td>{" "}
                </tr>
              ))}{" "}
            </tbody>{" "}
          </table>{" "}
        </div>
      ))}{" "}
    </div>
  );
};

export default VariableBrowser;
