`use strict`

import React from 'react';

export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.cols = 3;
  defaultRuntimeData.rows = 3;
  defaultRuntimeData.data = Array.from({ length: 3 }, () => Array(3).fill(""));
  defaultRuntimeData.columns = [
    { width: "33%", header: "ColumnHeader1", align: "center" },
    { width: "200px", header: "ColumnHeader2", align: "center" },
    { width: "auto", header: "ColumnHeader3", align: "center" }
  ];
  defaultRuntimeData.positionAlign = "left";
  return defaultRuntimeData;
}

export const getNewRuntimeData = (component, newData) => {
  const currentData = component.runtime_data || {};
  let newRuntimeData = { ...currentData };
  const [rowIdx, colIdx, value] = newData;
  const data = [...(currentData.data || [])];
  
  if (data[rowIdx]) {
    data[rowIdx][colIdx] = value;
    newRuntimeData.data = data;
  }
  return newRuntimeData;
}

export function renderProperty(component, updateRuntimeData, {
  renderWidthProperty, 
  renderForceNewLineProperty, 
  renderPositionAlignProperty}
) {

  const renderComponentProperty = (component) => {
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

      const handleColumnAlignChange = (index, value) => {
        const newColumns = [...(component.runtime_data?.columns || [])];
        newColumns[index] = {
          ...newColumns[index],
          align: value,
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

          {renderWidthProperty()}
          {renderForceNewLineProperty()}
          {renderPositionAlignProperty()}

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
                <div className="flex gap-2 mb-1">
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
                <div className="flex gap-2">
                  {/* <label className="text-sm pt-1 w-16">정렬:</label> */}
                  <select
                    value={col.align || "center"}
                    onChange={(e) => handleColumnAlignChange(idx, e.target.value)}
                    className="w-full border border-gray-300 rounded p-1"
                  >
                    <option value="left">왼쪽</option>
                    <option value="center">가운데</option>
                    <option value="right">오른쪽</option>
                  </select>
                </div>
              </div>
            ))}
        </div>
      );
  }

  return renderComponentProperty(component);
}

export const renderComponent = (component, handleComponentClick, onRuntimeDataChange, {
  selectedClass, 
  alignmentClass, 
  textAlign}) => {
  const style = {
    width: '100%',
    height: component.runtime_data?.height || 'auto',
    textAlign, // 텍스트 정렬 적용
  };

  const rows = component.runtime_data?.data || [];
  const columns = component.runtime_data?.columns || [];

  return (
    <table
      className={`${selectedClass} ${alignmentClass} border border-gray-400 w-full table-auto`}
      style={{
        ...style,
        borderCollapse: 'collapse',
      }}
      onClick={handleComponentClick}
    >
      <thead>
        <tr>
          {columns.map((col, colIdx) => (
            <th
              key={colIdx}
              className="border border-gray-300 px-2 py-1 bg-gray-100 text-center"
              style={{ width: col.width || 'auto' }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {columns.map((_, colIdx) => (
              <td key={colIdx} className="border border-gray-300 px-2 py-1">
                <input
                  type="text"
                  className="w-full border-none p-0"
                  style={{ textAlign: columns[colIdx].align || "center" }}
                  value={row[colIdx] || ''}
                  onChange={(e) =>
                    onRuntimeDataChange([rowIdx, colIdx, e.target.value])
                  }
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}