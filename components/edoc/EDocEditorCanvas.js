import React, { useEffect } from 'react';
import * as constants from '@/components/constants';

export default function EDocEditorCanvas({
  components,
  selectedComponentId,
  onComponentSelect,
  onDeleteComponent,
  onMoveUp,
  onMoveDown,
  onUpdateComponent,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onComponentSelect(null);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComponentSelect]);

  const handleRuntimeDataChange = (componentIdx, newData) => {
    const component = components[componentIdx];
    const updated = [...components];
    const currentData = component.runtime_data || {};

    let newRuntimeData = { ...currentData };

    switch (component.type) {
      case constants.edoc.COMPONENT_TYPE_TEXT:
        newRuntimeData.content = newData;
        break;
      case constants.edoc.COMPONENT_TYPE_INPUT:
        newRuntimeData.value = newData;
        break;
      case constants.edoc.COMPONENT_TYPE_TABLE: {
        const [rowIdx, colIdx, value] = newData;
        const data = [...(currentData.data || [])];
        if (data[rowIdx]) {
          data[rowIdx][colIdx] = value;
          newRuntimeData.data = data;
        }
        break;
      }
      case constants.edoc.COMPONENT_TYPE_CHECKLIST: {
        const [itemIdx, checked] = newData;
        const items = [...(currentData.items || [])];
        if (items[itemIdx]) {
          items[itemIdx] = { ...items[itemIdx], checked };
          newRuntimeData.items = items;
        }
        break;
      }
      case constants.edoc.COMPONENT_TYPE_IMAGE:
        newRuntimeData.src = newData;
        break;
      default:
        newRuntimeData = { ...currentData, ...newData };
    }

    updated[componentIdx] = {
      ...component,
      runtime_data: newRuntimeData,
    };
    onUpdateComponent(componentIdx, updated[componentIdx]);
  };

  return (
    <div
      id="editor-canvas"
      className="min-h-[500px] border border-dashed border-gray-400 bg-white p-4 rounded"
      onClick={() => onComponentSelect(null)}
    >
      {(!components || components.length === 0) && (
        <p className="text-gray-500 text-center mt-20">좌측에서 컴포넌트를 추가하세요.</p>
      )}
      {components.map((comp, idx) => (
        <div
          key={idx}
          className="relative group mb-4 border border-transparent rounded hover:border-gray-300 p-1 w-fit"
        >
          {/* 툴버튼 영역 */}
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
            onRuntimeDataChange={(...args) => handleRuntimeDataChange(idx, args.length === 1 ? args[0] : args)}
          />
        </div>
      ))}
    </div>
  );
}

function DocComponentRenderer({ component, isSelected, onSelect, onRuntimeDataChange }) {
  const selectedClass = isSelected ? 'outline outline-2 outline-blue-500 rounded bg-blue-50' : '';
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[component.runtime_data?.textAlign || 'left'];
  const style = {
  width: component.runtime_data?.width || 'auto',
  height: component.runtime_data?.height || 'auto',
};

  const handleComponentClick = (e) => {
    e.stopPropagation();
    onSelect();
  };

  switch (component.type) {
    case constants.edoc.COMPONENT_TYPE_TEXT:
      return (
        <p
          className={`${selectedClass} ${alignmentClass} h-auto whitespace-pre-wrap overflow-visible cursor-pointer`}
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
          style={style}
          value={component.runtime_data?.value || ''}
          placeholder={component.runtime_data?.placeholder || ''}
          onClick={handleComponentClick}
          onChange={(e) => onRuntimeDataChange(e.target.value)}
        />
      );

    case constants.edoc.COMPONENT_TYPE_TABLE: {
      const tableData =
        Array.isArray(component.runtime_data?.data) && component.runtime_data.data.length > 0
          ? component.runtime_data.data
          : Array.from({ length: 3 }, () => Array(3).fill(''));

      const columns =
        Array.isArray(component.runtime_data?.columns) && component.runtime_data.columns.length > 0
          ? component.runtime_data.columns.map((col) =>
              typeof col === 'string' ? { header: col, width: 'auto' } : col
            )
          : Array(tableData[0]?.length || 3)
              .fill(null)
              .map((_, idx) => ({ header: `열 ${idx + 1}`, width: 'auto' }));

      return (
        <table
          className={`${selectedClass} border border-gray-300 cursor-pointer`}
          style={style}
          onClick={handleComponentClick}
        >
          <thead>
            <tr>
              {columns.map((col, cIdx) => (
                <th
                  key={cIdx}
                  className="border border-gray-300 bg-gray-100 text-center p-2"
                  style={{ width: col.width || 'auto' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, columnIndex) => (
                  <td
                    key={columnIndex}
                    className="border border-gray-300 text-center min-w-[100px] h-10 py-2"
                    style={{ width: columns[columnIndex]?.width || 'auto' }}
                  >
                    {isSelected ? (
                      <input
                        className="w-full text-center border-none bg-transparent focus:outline-none"
                        value={cell}
                        onChange={(e) =>
                          onRuntimeDataChange(rowIndex, columnIndex, e.target.value)
                        }
                      />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    case constants.edoc.COMPONENT_TYPE_IMAGE:
      return (
        <div
          className={`${selectedClass} ${alignmentClass} cursor-pointer`}
          style={style}
          onClick={handleComponentClick}
        >
          {component.runtime_data?.src ? (
            <img
              src={component.runtime_data.src}
              alt="이미지"
              className="inline-block max-w-full h-auto"
            />
          ) : (
            <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500">
              이미지 없음
            </div>
          )}
        </div>
      );

    case constants.edoc.COMPONENT_TYPE_CHECKLIST:
      return (
        <div
          className={`${selectedClass} border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'} p-2 cursor-pointer`}
          style={style}
          onClick={handleComponentClick}
        >
          {(component.runtime_data?.items || []).map((item, idx) => (
            <label key={idx} className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => onRuntimeDataChange(idx, e.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      );

    default:
      return null;
  }
}
