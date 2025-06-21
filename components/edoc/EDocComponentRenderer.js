import React, { useEffect } from 'react';
import * as constants from '@/components/constants';

export default function DocComponentRenderer({
  component,
  isSelected,
  onSelect,
  onRuntimeDataChange,
  documentRuntimeData,
}) {
  const selectedClass = isSelected
    ? 'outline outline-2 outline-blue-500 rounded bg-blue-50'
    : '';

  // 내부 텍스트 정렬 (content 정렬용)
  const textAlign = component.runtime_data?.textAlign || documentRuntimeData?.alignment || 'left';
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign];

  const style = {
    width: '100%',
    height: component.runtime_data?.height || 'auto',
    textAlign, // 텍스트 정렬 적용
  };

  const handleComponentClick = (e) => {
    e.stopPropagation();
    onSelect();
  };

  const renderComponent = (component) => {
    switch (component.type) {
      case constants.edoc.COMPONENT_TYPE_TEXT:
        return (
          <p
            className={`${selectedClass} ${alignmentClass} whitespace-pre-wrap overflow-visible cursor-pointer`}
            style={style}
            onClick={handleComponentClick}
          >
            {(component.runtime_data?.content || '').split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
        );

      case constants.edoc.COMPONENT_TYPE_INPUT:
        return (
          <input
            type="text"
            className={`${selectedClass} ${alignmentClass} h-8 cursor-pointer`}
            style={{ ...style }}
            value={component.runtime_data?.value || ''}
            placeholder={component.runtime_data?.placeholder || ''}
            onClick={handleComponentClick}
            onChange={(e) => onRuntimeDataChange(e.target.value)}
          />
        );

      case constants.edoc.COMPONENT_TYPE_IMAGE:
        return (
          <div
            className={`${selectedClass} cursor-pointer`}
            onClick={handleComponentClick}
            style={{
              width:`100%`,
            }}
          >
            {component.runtime_data?.src ? (
              <img
                src={component.runtime_data.src}
                alt="이미지"
                className="inline-block h-auto"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                }}
              />
            ) : (
              <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500">
                이미지 없음
              </div>
            )}
          </div>
        );

      case constants.edoc.COMPONENT_TYPE_TABLE:
        const rows = component.runtime_data?.data || [];
        const columns = component.runtime_data?.columns || [];

        return (
          <table
            className={`${selectedClass} border border-gray-400 w-full table-auto`}
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

      case constants.edoc.COMPONENT_TYPE_CHECKLIST:
        const justifyMap = {
          left: 'flex-start',
          center: 'center',
          right: 'flex-end',
        };
        const justifyContent =
          justifyMap[
            component.runtime_data?.textAlign || 'left'
          ];

        return (
          <div
            className={`${selectedClass} border p-2 cursor-pointer flex flex-col`}
            style={{
              ...style,
              justifyContent,
              alignItems: justifyContent,
            }}
            onClick={handleComponentClick}
          >
            {(component.runtime_data?.items || []).map((item, idx) => (
              <label
                key={idx}
                className="flex items-center space-x-2 mb-1"
                style={{ justifyContent }}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => onRuntimeDataChange([idx, e.target.checked])}
                />
                <span>{item.label || `항목 ${idx + 1}`}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }    
  }

  return renderComponent(component);
}
