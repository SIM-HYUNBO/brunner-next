import React from 'react';
import * as constants from '@/components/constants';

/**
 * EDocEditorCanvas.js
 * EDoc 편집기 캔버스 컴포넌트
 * 컴포넌트들을 렌더링하고 선택된 컴포넌트를 강조 표시
 */
export default function EDocEditorCanvas({ components, selectedComponentId, onComponentSelect, onDeleteComponent, onMoveUp, onMoveDown }) {
  return (
    <div id="editor-canvas" className="min-h-[500px] border border-dashed border-gray-400 bg-white p-4 rounded">
      {(!components || components.length === 0) && (
        <p className="text-gray-500 text-center mt-20">좌측에서 컴포넌트를 추가하세요.</p>
      )}
      {components &&
        components.map((comp, idx) => (
          <div key={idx} className="relative group mb-4 border border-transparent rounded hover:border-gray-300 p-1">
            {/* 위/아래 이동 버튼 */}
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition">
              <button
                className="text-xs bg-white border rounded shadow px-1 hover:bg-gray-100 disabled:opacity-30"
                onClick={() => onMoveUp(idx)}
                disabled={idx === 0}
                title="위로 이동"
              >
                ↑
              </button>
              <button
                className="text-xs bg-white border rounded shadow px-1 hover:bg-gray-100 disabled:opacity-30"
                onClick={() => onMoveDown(idx)}
                disabled={idx === components.length - 1}
                title="아래로 이동"
              >
                ↓
              </button>
              <button
                onClick={() => onDeleteComponent(idx)}
                disabled={selectedComponentId === null}
                title="삭제"
              >
                🗑
              </button>
            </div>

            <DocComponentRenderer
              component={comp}
              isSelected={selectedComponentId === idx}
              onSelect={() => onComponentSelect(idx)}
            />
          </div>
        ))}
    </div>
  );
}

function DocComponentRenderer({ component, isSelected, onSelect, onTableCellChange }) {
  const baseClass = 'cursor-pointer';
  const selectedClass = isSelected ? 'border-2 border-blue-500 bg-blue-50 rounded' : '';
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[component.runtime_data?.textAlign || 'left'];

  switch (component.type) {
    case constants.edoc.COMPONENT_TYPE_TEXT:
      return (
        <p className={`${baseClass} ${selectedClass} ${alignmentClass}`} onClick={onSelect}>
          {component.runtime_data.content.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
      );

    case constants.edoc.COMPONENT_TYPE_TABLE:
      // 깊은 복사하여 불변성 유지
      const tableData = component.runtime_data?.data?.length
        ? component.runtime_data.data.map(row => [...row])
        : Array(3).fill('').map(() => '');

      // columns도 복사
      const columns = component.runtime_data?.columns?.length
        ? component.runtime_data.columns.map(col => ({ ...col }))
        : tableData[0]?.map((_, idx) => ({ header: `열 ${idx + 1}`, width: 'auto' })) || [];

      return (
        <table
          className={`${baseClass} ${selectedClass} border border-gray-300`}
          onClick={onSelect}
          style={{ width: component.runtime_data?.width || '100%' }}
        >
          <thead>
            <tr>
              {columns.map((col, cIdx) => (
                <th
                  key={cIdx}
                  className="border border-gray-300 px-3 py-1 bg-gray-100"
                  style={{ width: col.width || 'auto' }}
                >
                  {col.header || `열 ${cIdx + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="border border-gray-300 px-4 py-2 text-center min-w-[100px] h-[40px]"
                    style={{ width: columns[cIdx]?.width || 'auto' }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case constants.edoc.COMPONENT_TYPE_IMAGE:
      const imageAlign = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      }[component.runtime_data?.textAlign || 'left'];

      return (
        <div className={`${baseClass} ${selectedClass} ${imageAlign}`} onClick={onSelect}>
          {component.runtime_data?.src ? (
            <img src={component.runtime_data.src} alt="이미지" className="inline-block max-w-full h-auto" />
          ) : (
            <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500">이미지 없음</div>
          )}
        </div>
      );

    case constants.edoc.COMPONENT_TYPE_INPUT:
      return (
        <input
          className={`w-full h-10 border-none rounded bg-transparent ${alignmentClass}`}
          onClick={onSelect}
          type="text"
          value={component.runtime_data?.value || ''}
          placeholder={component.runtime_data?.placeholder || ''}
          readOnly
        />
      );

    default:
      return null;
  }
}
