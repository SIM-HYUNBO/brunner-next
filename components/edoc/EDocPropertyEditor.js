import * as constants from "@/components/constants";
/*
 * EDocPropertyEditor.js
 * EDoc 컴포넌트의 속성을 편집하는 컴포넌트
 */
export default function EDocPropertyEditor({ component, onComponentChange }) {
  if (!component) return <p>컴포넌트를 선택하세요.</p>;

  const updateRuntimeData = (key, value) => {
    const newRuntimeData = {
      ...component.runtime_data,
      [key]: value,
    };

    onComponentChange({
      ...component,
      runtime_data: newRuntimeData,
    });
  };

  const updateRuntimeDataAll = (newRuntimeData) => {
    onComponentChange({
      ...component,
      runtime_data: {
        ...newRuntimeData,
      },
    });
  };

  const renderWidthInput = () => (
    <>
      <label className="block mt-2 mb-1">폭 (예: 100%, 400px):</label>
      <input
        type="text"
        value={component.runtime_data?.width || 'auto'}
        onChange={(e) => updateRuntimeData("width", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />
    </>
  );

  const renderForceNewLineToggle = () => (
    <div className="mt-2 mb-2">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          checked={!!component.runtime_data?.forceNewLine}
          onChange={(e) => updateRuntimeData("forceNewLine", e.target.checked)}
          className="mr-2"
        />
        다음줄에 표시
      </label>
    </div>
  );

  switch (component.type) {
    case constants.edoc.COMPONENT_TYPE_TEXT:
      return (
        <div>
          <label>Binding Key:</label>
          <input
            type="text"
            value={component.runtime_data?.bindingKey || ''}
            onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />

          {renderWidthInput()}
          {renderForceNewLineToggle()}

          <label>표시할 텍스트:</label>
          <textarea
            value={component.runtime_data?.content || ''}
            onChange={(e) => updateRuntimeData("content", e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded p-2"
          />

          <label>정렬:</label>
          <select
            value={component.runtime_data?.textAlign || 'left'}
            onChange={(e) => updateRuntimeData("textAlign", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          >
            <option value="left">왼쪽</option>
            <option value="center">가운데</option>
            <option value="right">오른쪽</option>
          </select>
        </div>
      );

    case constants.edoc.COMPONENT_TYPE_TABLE:
      const updateTableSize = (newRows, newCols) => {
        const oldData = component.runtime_data?.data || [];
        const oldColumns = component.runtime_data?.columns || [];
        const newData = Array.from({ length: newRows }, (_, r) =>
          Array.from({ length: newCols }, (_, c) => oldData[r]?.[c] ?? "")
        );
        const newColumns = Array.from({ length: newCols }, (_, c) =>
          oldColumns[c] ?? { header: `ColumnHeader ${c + 1}`, width: "auto" }
        );

        onComponentChange({
          ...component,
          runtime_data: {
            ...component.runtime_data,
            rows: newRows,
            cols: newCols,
            data: newData,
            columns: newColumns,
          }
        });
      };

      const handleColumnHeaderChange = (index, value) => {
        const newColumns = [...(component.runtime_data?.columns || [])];
        newColumns[index] = {
          ...newColumns[index],
          header: value,
        };
        updateRuntimeData("columns", newColumns);
      };

      const handleColumnWidthChange = (index, value) => {
        const newColumns = [...(component.runtime_data?.columns || [])];
        newColumns[index] = {
          ...newColumns[index],
          width: value,
        };
        updateRuntimeData("columns", newColumns);
      };

      return (
        <div>
          <label>Binding Key:</label>
          <input
            type="text"
            value={component.runtime_data?.bindingKey || ''}
            onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />

          {renderWidthInput()}
          {renderForceNewLineToggle()}

          <label className="block mt-2 mb-1">행 수:</label>
          <input
            type="number"
            value={component.runtime_data?.rows || 1}
            onChange={(e) =>
              updateTableSize(parseInt(e.target.value), component.runtime_data?.cols || 1)
            }
            className="w-full border border-gray-300 rounded p-1"
          />

          <label className="block mt-2 mb-1">열 수:</label>
          <input
            type="number"
            value={component.runtime_data?.cols || 1}
            onChange={(e) =>
              updateTableSize(component.runtime_data?.rows || 1, parseInt(e.target.value))
            }
            className="w-full border border-gray-300 rounded p-1"
          />

          <label className="block mt-3 mb-1">컬럼 설정:</label>
          {(component.runtime_data?.columns || []).map((col, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={col.header || ""}
                  onChange={(e) => handleColumnHeaderChange(idx, e.target.value)}
                  className="w-1/2 border border-gray-300 rounded p-1"
                  placeholder={`헤더 ${idx + 1}`}
                />
                <input
                  type="text"
                  value={col.width || ""}
                  onChange={(e) => handleColumnWidthChange(idx, e.target.value)}
                  className="w-1/2 border border-gray-300 rounded p-1"
                  placeholder={`폭 (예: 100px, 20%)`}
                />
              </div>
            </div>
          ))}
        </div>
      );

    case constants.edoc.COMPONENT_TYPE_INPUT:
      return (
        <div>
          <label>Binding Key:</label>
          <input
            type="text"
            value={component.runtime_data?.bindingKey || ''}
            onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />

          {renderWidthInput()}
          {renderForceNewLineToggle()}

          <label>placeholder 텍스트:</label>
          <input
            type="text"
            value={component.runtime_data?.placeholder || ''}
            onChange={(e) => updateRuntimeData("placeholder", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />
        </div>
      );

    case constants.edoc.COMPONENT_TYPE_CHECK:
      return (
        <div>
          <label>Binding Key:</label>
          <input
            type="text"
            value={component.runtime_data?.bindingKey || ''}
            onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />

          {renderWidthInput()}
          {renderForceNewLineToggle()}

          <label>체크박스 라벨:</label>
          <input
            type="text"
            value={component.runtime_data?.label || ''}
            onChange={(e) => updateRuntimeData("label", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />
        </div>
      );

    case constants.edoc.COMPONENT_TYPE_IMAGE:
      return (
        <div>
          <label>이미지 URL:</label>
          <input
            type="text"
            value={component.runtime_data?.src || ''}
            onChange={(e) => updateRuntimeData("src", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />

          {renderWidthInput()}
          {renderForceNewLineToggle()}
        </div>
      );      

    case constants.edoc.COMPONENT_TYPE_CHECKLIST:
      return (
        <div>
          <label>Binding Key:</label>
          <input
            type="text"
            value={component.runtime_data?.bindingKey || ''}
            onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />

          {renderWidthInput()}
          {renderForceNewLineToggle()}

          <label>항목 목록 (쉼표로 구분):</label>
          <input
            type="text"
            value={component.runtime_data?.items?.join(", ") || ""}
            onChange={(e) =>
              updateRuntimeData("items", e.target.value.split(",").map((item) => item.trim()))
            }
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />
        </div>
      );      
      default:
        return <p>속성 편집이 지원되지 않는 컴포넌트입니다.</p>;
  }
}