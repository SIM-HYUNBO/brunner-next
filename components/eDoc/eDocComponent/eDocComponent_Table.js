'use strict'

import React from 'react';
import EDocTextStyleEditor from "@/components/eDoc/eDocTextStyleEditor";

/**
 * 초기 RuntimeData 생성
 */
export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.cols = 3;
  defaultRuntimeData.rows = 3;
  defaultRuntimeData.data = Array.from({ length: 3 }, () => Array(3).fill(""));
  defaultRuntimeData.columns = [
    { width: "33%", header: "Header1", align: "center" },
    { width: "200px", header: "Header2", align: "center" },
    { width: "auto", header: "Header3", align: "center" }
  ];
  defaultRuntimeData.positionAlign = "left";
  
  // font 관련 기본 설정
  defaultRuntimeData.fontFamily = "Arial";
  defaultRuntimeData.fontSize = 12;
  defaultRuntimeData.underline = false;
  defaultRuntimeData.fontColor =  "#000000";
  defaultRuntimeData.backgroundColor = "#ffffff";
  defaultRuntimeData.fontWeight = "normal";

  return defaultRuntimeData;
};

export const getBindingValue = (component) => {
  if (!component?.runtime_data?.bindingKey) return null;

  const { data, columns } = component.runtime_data;

  if (!Array.isArray(data) || !Array.isArray(columns)) {
    return [];
  }

  return data.map((row) => {
    const rowObj = {};
    columns.forEach((colKey, idx) => {
      rowObj[colKey.header] = row[idx] ?? null;
    });
    return rowObj;
  });
};

/**
 * 셀 데이터 변경
 */
export const getNewRuntimeData = (component, rowIdx, colIdx, newValue) => {
  const currentData = component.runtime_data || {};
  const oldData = Array.isArray(currentData.data) ? currentData.data : [];
  // 2차원 배열 깊은 복사
  const newData = oldData.map(row => Array.isArray(row) ? [...row] : []);
  // 값 변경
  if (newData[rowIdx] && typeof colIdx === "number") {
    newData[rowIdx][colIdx] = newValue;
  }
  // 새로운 객체 반환
  return {
    ...currentData,
    data: newData,
  };
};

/**
 * 속성 편집 렌더링
 */
export function renderProperty(component, updateRuntimeData, renderWidthProperty, renderForceNewLineProperty, renderPositionAlignProperty) {

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

        // 한 번에 runtime_data 객체를 만들어 전달!
        const newRuntimeData = {
          ...component.runtime_data,
          rows: newRows,
          cols: newCols,
          data: newData,
          columns: newColumns,
        };

        updateRuntimeData('runtime_data', newRuntimeData);
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
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                value={col.header || ""}
                onChange={(e) => {
                  const newColumns = [...component.runtime_data.columns];
                  newColumns[idx] = { ...newColumns[idx], header: e.target.value };
                  updateRuntimeData("columns", newColumns);
                }}
                className="w-1/2 border border-gray-300 rounded p-1"
                placeholder={`헤더 ${idx + 1}`}
              />
              <input
                type="text"
                value={col.width || ""}
                onChange={(e) => {
                  const newColumns = [...component.runtime_data.columns];
                  newColumns[idx] = { ...newColumns[idx], width: e.target.value };
                  updateRuntimeData("columns", newColumns);
                }}
                className="w-1/5 border border-gray-300 rounded p-1"
                placeholder="폭 (예: 100px, 20%)"
              />
              <select
                value={col.align || "center"}
                onChange={(e) => {
                  const newColumns = [...component.runtime_data.columns];
                  newColumns[idx] = { ...newColumns[idx], align: e.target.value };
                  updateRuntimeData("columns", newColumns);
                }}
                className="w-2/5 border border-gray-300 rounded p-1"
              >
                <option value="left">왼쪽</option>
                <option value="center">가운데</option>
                <option value="right">오른쪽</option>
              </select>
            </div>
          ))}


          {renderWidthProperty()}
          {renderForceNewLineProperty()}
          {renderPositionAlignProperty()}

          <EDocTextStyleEditor
            fontFamily={component.runtime_data?.fontFamily || 'Arial'}
            fontSize={component.runtime_data?.fontSize || 12}
            fontWeight={component.runtime_data?.fontWeight || 'normal'}
            underline={component.runtime_data?.underline || false}
            fontColor={component.runtime_data?.fontColor || '#000000'}
            backgroundColor={component.runtime_data?.backgroundColor || '#ffffff'}
            onChange={(updatedProps) => {
              Object.entries(updatedProps).forEach(([key, value]) => {
                updateRuntimeData(key, value);
              });
            }}
          />      
        </div>
      );
    };

  return renderComponentProperty(component);
}

/**
 * 컴포넌트 렌더링
 */
export default function RenderComponent (props) {
  const {
    component: comp,
    handleComponentClick,
    onRuntimeDataChange,
    selectedClass, 
    alignmentClass, 
    textAlign, 
    isDesignMode, 
    bindingData, 
    documentData 
  } = props;
  
  const style = {
    width: '100%',
    height: comp.runtime_data?.height || 'auto',
    textAlign,
    fontFamily: comp.runtime_data?.fontFamily || 'inherit',
    fontSize: comp.runtime_data?.fontSize ? `${comp.runtime_data.fontSize}px` : 'inherit',
    fontWeight: comp.runtime_data?.fontWeight || 'normal',
    color: comp.runtime_data?.fontColor || 'inherit',
    backgroundColor: comp.runtime_data?.backgroundColor || 'transparent',
    textDecoration: comp.runtime_data?.underline ? 'underline' : 'none',
  };

  const rows = comp.runtime_data?.data || [];
  const columns = comp.runtime_data?.columns || [];
  
  return (
    <table
      className={`${selectedClass} ${alignmentClass} border border-gray-400 w-full table-auto`}
      style={{
        ...style,
        borderCollapse: 'collapse',
        tableLayout: 'fixed', // 고정 테이블 레이아웃 적용
        width: '100%', // 고정폭 필요
      }}
      onClick={handleComponentClick}
    >
      <colgroup>
        {columns.map((col, colIdx) => (
          <col
            key={colIdx}
            style={{ width: col.width || 'auto' }}
          />
        ))}
      </colgroup>
      <thead>
        <tr>
          {columns.map((col, colIdx) => (
            <th
              key={colIdx}
              className="border border-gray-300 px-2 py-1 text-center"
              style={{
                verticalAlign: 'middle',
                height: '40px',
                textAlign: col.align || "center",
                backgroundColor: comp.runtime_data?.backgroundColor || '#ffffff', // 추가
                color: comp.runtime_data?.fontColor || '#000000', // 필요 시 추가
                fontFamily: comp.runtime_data?.fontFamily || 'inherit',
                fontSize: comp.runtime_data?.fontSize ? `${comp.runtime_data.fontSize}px` : 'inherit',
                fontWeight: comp.runtime_data?.fontWeight || 'normal',
                textDecoration: comp.runtime_data?.underline ? 'underline' : 'none',
              }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {columns.map((col, colIdx) => (
              <td
                key={colIdx}
                className="border border-gray-300"
                style={{
                  verticalAlign: 'middle',
                  height: '40px',
                  textAlign: col.align || "center",
                }}
              >
              <input
                    type="text"
                    className="w-full border-none"
                    style={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',
                      height: '100%',
                      textAlign: col.align || "center",
                      fontFamily: style.fontFamily,
                      fontSize: style.fontSize,
                      fontWeight: style.fontWeight,
                      color: style.color,
                      backgroundColor: 'transparent',
                      textDecoration: style.textDecoration,
                    }}
                    value={row[colIdx] || ''}
                    onChange={(e) => {
                      const updatedRuntimeData = getNewRuntimeData(comp, rowIdx, colIdx, e.target.value);
                        onRuntimeDataChange({
                        ...comp,
                        runtime_data: updatedRuntimeData
                      });
                    }}
                  />
              </td>
            ))}
          </tr> 
        ))}
      </tbody>
    </table>
  );
};
