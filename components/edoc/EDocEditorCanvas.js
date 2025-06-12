import React from 'react';
import * as constants from '@/components/constants'

export default function EDocEditorCanvas({ components, selectedComponentId, onComponentSelect }) {
  return (
    <div className="min-h-[500px] border border-dashed border-gray-400 bg-white p-4 rounded">
      {components.length === 0 && (
        <p className="text-gray-500 text-center mt-20">좌측에서 컴포넌트를 추가하세요.</p>
      )}
      {components.map((comp, idx) => (
        <DocComponentRenderer
          key={idx}
          component={comp}
          isSelected={selectedComponentId === idx}
          onSelect={() => onComponentSelect(idx)}
        />
      ))}
    </div>
  );
}

function DocComponentRenderer({ component, isSelected, onSelect }) {
  const baseClass = "mb-3 cursor-pointer";
  const selectedClass = isSelected ? "border-2 border-blue-500 bg-blue-50 rounded" : "";

  switch (component.type) {
    case constants.edoc.COMPONENT_TYPE_TEXT:
      return (
        <p
          className={`${baseClass} ${selectedClass}`}
          onClick={onSelect}
        >
          {component.template_json.content.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
      );
    case constants.edoc.COMPONENT_TYPE_TABLE:
      const tableData = component.runtime_data.data || [[]];
        return (
          <table
            className={`${baseClass} ${selectedClass} border border-gray-300`}
            onClick={onSelect}
          >
          <thead>
            <tr>
              {component.runtime_data?.columns?.map((col, cIdx) => (
                <th key={cIdx} className="border border-gray-300 px-3 py-1 bg-gray-100">
                  {col}
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
      return (
        <div
          className={`${baseClass} ${selectedClass}`}
          onClick={onSelect}
        >
          {component.src ? (
            <img src={component.src} alt="이미지" className="max-w-full h-auto" />
          ) : (
            <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500">
              이미지 없음
            </div>
          )}
        </div>
      );
    case constants.edoc.COMPONENT_TYPE_INPUT:
      return (
        <input
      className="mb-3 border border-gray-400 rounded px-2 py-1"
      onClick={onSelect}
      type="text"
      value={component.runtime_data?.value || ''}  // 수정된 부분
      placeholder={component.template_json?.placeholder || ''}
      readOnly
    />
      );
    default:
      return null;
  }
}