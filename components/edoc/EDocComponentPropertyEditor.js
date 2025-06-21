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

  const renderWidthInput = () => (
    <>
      <label className="block mt-2 mb-1">폭 (예: 100%, 400px):</label>
      <input
        type="text"
        value={component.runtime_data?.width || '100%'}
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

  const renderPositionAlignSelect = () => (
    <>
      <label>정렬:</label>
      <select
        value={component.runtime_data?.positionAlign || 'left'}qk
        onChange={(e) => updateRuntimeData("positionAlign", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      >
        <option value="left">왼쪽</option>
        <option value="center">가운데</option>
        <option value="right">오른쪽</option>
      </select>
    </>
  );

  const renderComponentProperty = (component) => {
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
          {renderPositionAlignSelect()}

          <label>내용 정렬:</label>
          <select
            value={component.runtime_data?.textAlign || 'left'}
            onChange={(e) => updateRuntimeData("textAlign", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          >
            <option value="left">왼쪽</option>
            <option value="center">가운데</option>
            <option value="right">오른쪽</option>
          </select>

          <label>표시할 텍스트:</label>
          <textarea
            value={component.runtime_data?.content || ''}
            onChange={(e) => updateRuntimeData("content", e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded p-2"
          />
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
          {renderPositionAlignSelect()}

          <label className="block mt-2 mb-1">행 수:</label>
          <input
            type="number"
            min={1}
            value={component.runtime_data?.rows || 1}
            onChange={(e) =>
              updateTableSize(parseInt(e.target.value) || 1, component.runtime_data?.cols || 1)
            }
            className="w-full border border-gray-300 rounded p-1"
          />

          <label className="block mt-2 mb-1">열 수:</label>
          <input
            type="number"
            min={1}
            value={component.runtime_data?.cols || 1}
            onChange={(e) =>
              updateTableSize(component.runtime_data?.rows || 1, parseInt(e.target.value) || 1)
            }
            className="w-full border border-gray-300 rounded p-1"
          />

          <label className="block mt-3 mb-1">컬럼 설정:</label>
          {(component.runtime_data?.columns || []).map((col, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={component.runtime_data?.columns[idx].header || ""}
                  onChange={(e) => handleColumnHeaderChange(idx, e.target.value)}
                  className="w-1/2 border border-gray-300 rounded p-1"
                  placeholder={`헤더 ${idx + 1}`}
                />
                <input
                  type="text"
                  value={component.runtime_data?.columns[idx].width || ""}
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
          {renderPositionAlignSelect()}

          <label>텍스트:</label>
          <input
            type="text"
            value={component.runtime_data?.value || ''}
            onChange={(e) => updateRuntimeData("placeholder", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />

          <label>내용 정렬:</label>
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

    case constants.edoc.COMPONENT_TYPE_IMAGE:
      return (
        <div>
          <label>Binding Key:</label>
          <input
            type="text"
            value={component.runtime_data?.bindingKey || ''}
            onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />          
          <label>이미지 URL:</label>
          <input
            type="text"
            value={component.runtime_data?.src || ''}
            onChange={(e) => updateRuntimeData("src", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />

          {renderWidthInput()}
          {renderForceNewLineToggle()}
          {renderPositionAlignSelect()}
        </div>
      );

    case constants.edoc.COMPONENT_TYPE_CHECKLIST:
      const items = component.runtime_data?.items || [];

      const updateItemLabel = (idx, newLabel) => {
        const newItems = items.map((item, i) =>
          i === idx ? { ...item, label: newLabel } : item
        );
        updateRuntimeData("items", newItems);
      };

      const toggleItemChecked = (idx) => {
        const newItems = items.map((item, i) =>
          i === idx ? { ...item, checked: !item.checked } : item
        );
        updateRuntimeData("items", newItems);
      };

      const addItem = () => {
        const newItems = [...items, { label: `항목 ${items.length + 1}`, checked: false }];
        updateRuntimeData("items", newItems);
      };

      const removeItem = (idx) => {
        const newItems = items.filter((_, i) => i !== idx);
        updateRuntimeData("items", newItems);
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
          {renderPositionAlignSelect()}

          <label>내용 정렬:</label>
          <select
            value={component.runtime_data?.textAlign || 'left'}
            onChange={(e) => updateRuntimeData("textAlign", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          >
            <option value="left">왼쪽</option>
            <option value="center">가운데</option>
            <option value="right">오른쪽</option>
          </select>

          <label className="block mb-2">항목 목록:</label>
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center mb-1 gap-2">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItemChecked(idx)}
              />
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItemLabel(idx, e.target.value)}
                className="border border-gray-300 rounded p-1 flex-grow"
              />
              <button
                onClick={() => removeItem(idx)}
                className="bg-red-500 text-white px-2 rounded"
                title="항목 삭제"
                type="button"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addItem}
            className="mt-2 bg-blue-500 text-white rounded px-4 py-1"
            type="button"
          >
            항목 추가
          </button>
        </div>
      );

    default:
      return <p>속성 편집이 지원되지 않는 컴포넌트입니다.</p>;
  }
  }

  return renderComponentProperty(component);
}
