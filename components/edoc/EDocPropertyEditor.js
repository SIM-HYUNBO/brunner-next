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

  switch (component.type) {
    case constants.edoc.COMPONENT_TYPE_TEXT:
      return (
        <div>
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
        onComponentChange({
          ...component,
          runtime_data: {
            ...component.runtime_data,
            columns: newColumns,
          }
        });
      };

      const handleColumnWidthChange = (index, value) => {
        const newColumns = [...(component.runtime_data?.columns || [])];
        newColumns[index] = {
          ...newColumns[index],
          width: value,
        };
        onComponentChange({
          ...component,
          runtime_data: {
            ...component.runtime_data,
            columns: newColumns,
          }
        });
      };

      return (
        <div>
          <label className="block mt-2 mb-1">테이블 전체 폭 (예: 100%, 800px):</label>
          <input
            type="text"
            value={component.runtime_data?.width || ''}
            onChange={(e) => updateRuntimeData("width", e.target.value)}
            className="w-full border border-gray-300 rounded p-1 mb-2"
            placeholder="예: 100%, 800px"
          />

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

    case constants.edoc.COMPONENT_TYPE_IMAGE:
      const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
          updateRuntimeData("src", reader.result); // Base64로 저장
        };
        reader.readAsDataURL(file);
      };

      return (
        <div>
          <label>이미지 URL 또는 업로드:</label>
          <input
            type="text"
            value={component.runtime_data?.src || ''}
            onChange={(e) => updateRuntimeData("src", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
            placeholder="직접 입력하거나 아래에서 업로드하세요"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-2"
          />

          <label className="block mt-2">정렬:</label>
          <select
            value={component.runtime_data?.textAlign || 'left'}
            onChange={(e) => updateRuntimeData("textAlign", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          >
            <option value="left">왼쪽</option>
            <option value="center">가운데</option>
            <option value="right">오른쪽</option>
          </select>

          {component.runtime_data?.src && (
            <img
              src={component.runtime_data.src}
              alt="선택된 이미지"
              className="mt-2 max-w-full h-auto border"
            />
          )}
        </div>
      );

    case constants.edoc.COMPONENT_TYPE_INPUT:
      return (
        <div>
          <label>입력값</label>
          <input
            type="text"
            value={component.runtime_data?.placeholder || ''}
            onChange={(e) => updateRuntimeData("placeholder", e.target.value)}
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

    default:
      return <p>속성 편집이 지원되지 않는 컴포넌트입니다.</p>;
  }
}
