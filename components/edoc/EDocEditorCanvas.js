import React, {useEffect} from 'react';
import * as constants from '@/components/constants';

/**
 * EDocEditorCanvas.js
 * EDoc 편집기 캔버스 컴포넌트
 * 컴포넌트들을 렌더링하고 선택된 컴포넌트를 강조 표시
 */
export default function EDocEditorCanvas({
  components,
  selectedComponentId,
  onComponentSelect,
  onDeleteComponent,
  onMoveUp,
  onMoveDown,
  onUpdateComponent, // 🔹 새롭게 전달받을 prop
}) {
    useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onComponentSelect(null);
         // 🔹 포커스 해제
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComponentSelect]);
  
  const handleRuntimeDataChange = (componentIdx, newRuntimeData) => {
    const updated = [...components];
    const component = updated[componentIdx];

    // 분기 처리: 컴포넌트 타입별로 runtime_data 갱신 방법이 다름
    // let newRuntimeData = { ...component.runtime_data };

    switch (component.type) {
      case constants.edoc.COMPONENT_TYPE_TABLE:
        if (
          typeof newRuntimeData.rowIdx === 'number' &&
          typeof newRuntimeData.colIdx === 'number'
        ) {
          const data = [...(component.runtime_data?.data || [])];
          data[newRuntimeData.rowIdx][newRuntimeData.colIdx] = newRuntimeData.value;
          newRuntimeData = { ...newRuntimeData, data };
        }
        break;

      case constants.edoc.COMPONENT_TYPE_TEXT:
        if (typeof newRuntimeData.content === 'string') {
          newRuntimeData = { ...newRuntimeData, content: newRuntimeData.content };
        }
        break;

      case constants.edoc.COMPONENT_TYPE_INPUT:
        if (typeof newRuntimeData.value === 'string') {
          newRuntimeData = { ...newRuntimeData, value: newRuntimeData.value };
        }
        break;

      case constants.edoc.COMPONENT_TYPE_CHECKLIST:
          if (Array.isArray(newRuntimeData.items)) {
          newRuntimeData = { ...newRuntimeData, items: newRuntimeData.items };
        }
        break;

      case constants.edoc.COMPONENT_TYPE_IMAGE:
        if (typeof newRuntimeData.src === 'string') {
          newRuntimeData = { ...newRuntimeData, src: newRuntimeData.src };
        }
        break;

      default:
        // 기타: 전체 runtime_data 덮어쓰기
        newRuntimeData = { ...newRuntimeData, ...newRuntimeData };
    }

    updated[componentIdx] = {
      ...component,
      runtime_data: newRuntimeData,
    };

    onUpdateComponent(updated);
  };

  return (
    <div id="editor-canvas" 
        className="min-h-[500px] border border-dashed border-gray-400 bg-white p-4 rounded"
        onClick={() => onComponentSelect(null)} // ← 빈 공간 클릭 시 선택 해제
    >
        
      {(!components || components.length === 0) && (
        <p className="text-gray-500 text-center mt-20">좌측에서 컴포넌트를 추가하세요.</p>
      )}
      {components &&
        components.map((comp, idx) => (
          <div key={idx} className="relative group mb-4 border border-transparent rounded hover:border-gray-300 p-1">
            {/* 위/아래 이동/삭제 버튼은 그대로 유지 */}
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
              onRuntimeDataChange={(...args) => {
                const current = components[idx];

                let newRuntimeData = current.runtime_data;

                switch (current.type) {
                  case constants.edoc.COMPONENT_TYPE_TABLE: {
                    const [rowIdx, colIdx, value] = args;
                    const updatedData = [...current.runtime_data.data];
                    updatedData[rowIdx][colIdx] = value;
                    newRuntimeData = {
                      ...current.runtime_data,
                      data: updatedData,
                    };
                    break;
                  }

                  case constants.edoc.COMPONENT_TYPE_CHECKLIST: {
                    const [itemIdx, checked] = args;
                    const updatedItems = [...current.runtime_data.items];
                    updatedItems[itemIdx] = {
                      ...updatedItems[itemIdx],
                      checked,
                    };
                    newRuntimeData = {
                      ...current.runtime_data,
                      items: updatedItems,
                    };
                    break;
                  }

                  case constants.edoc.COMPONENT_TYPE_INPUT: {
                    const [value] = args;
                    newRuntimeData = {
                      ...current.runtime_data,
                      value,
                    };
                    break;
                  }

                  case constants.edoc.COMPONENT_TYPE_TEXT: {
                    const [content] = args;
                    newRuntimeData = {
                      ...current.runtime_data,
                      content,
                    };
                    break;
                  }

                  default:
                    return;
                }

                handleRuntimeDataChange(idx, newRuntimeData);
              }}
            />
          </div>
        ))}
    </div>
  );
}

function DocComponentRenderer({ component, isSelected, onSelect, onRuntimeDataChange }) {
  const defaultLineHeight = 'h-8'; // 기본 줄 높이 설정
  const defaultCellHeight = 'h-10 py-2'; // 테이블 셀 높이 설정
  const baseClass = 'w-full cursor-pointer';
  const selectedClass = isSelected
      ? 'outline outline-2 outline-blue-500 rounded bg-blue-50'
      : '';
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[component.runtime_data?.textAlign || 'left'];
    
  switch (component.type) {
    case constants.edoc.COMPONENT_TYPE_TEXT:
      return (
        <p 
          className={`${baseClass} ${selectedClass} ${alignmentClass} ${defaultLineHeight}`} 
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}>
          {component.runtime_data.content.split('\n').map((line, idx) => (
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
          className={`${baseClass} ${selectedClass} ${alignmentClass} ${defaultLineHeight}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          type="text"
          value={component.runtime_data?.value || ''}
          placeholder={component.runtime_data?.placeholder || ''}
          // readOnly
        />
      );

    case constants.edoc.COMPONENT_TYPE_TABLE:
    // runtime_data.data가 배열인지 확인하고 깊은 복사, 없으면 3x3 빈 데이터 생성
    const tableData = Array.isArray(component.runtime_data?.data) && component.runtime_data.data.length > 0 ? 
    component.runtime_data.data.map(row => [...row]): 
    Array.from({ length: 3 }, () => Array(3).fill(''));

    // columns가 문자열 배열이면 객체 배열로 변환, 기본값 생성
    const columns = Array.isArray(component.runtime_data?.columns) && component.runtime_data.columns.length > 0 ? 
    component.runtime_data.columns.map(col => typeof col === 'string' ? { header: col, width: 'auto' } : { ...col }): 
    Array(tableData[0]?.length || 3).fill(null).map((_, idx) => ({ header: `열 ${idx + 1}`, width: 'auto' }));

    return (
      <table className={`${baseClass} ${selectedClass} border border-gray-300`} 
             onClick={(e) => { e.stopPropagation();onSelect();}}
             style={{ width: component.runtime_data?.width || '100%' }}
      >
        <thead>
          <tr>
            {columns.map((col, cIdx) => (
              <th
                key={cIdx}
                className={`border border-gray-300 bg-gray-100 text-center align-middle p-2 ${col.width ? `w-[${col.width}]` : ''}`}
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
                  className={`border border-gray-300 text-center align-middle min-w-[100px] ${defaultCellHeight}`}
                  style={{ width: columns[cIdx]?.width || 'auto' }}
                >
                  {isSelected ? (
                    <input
                      className="w-full text-center border-none bg-transparent focus:outline-none"
                      value={cell}
                      onChange={(e) => onRuntimeDataChange?.(rIdx, cIdx, e.target.value)}
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

    case constants.edoc.COMPONENT_TYPE_IMAGE:
      const imageAlign = {left: 'text-left', center: 'text-center', right: 'text-right',}[component.runtime_data?.textAlign || 'left'];

      return (
        <div className={`${baseClass} ${selectedClass} ${imageAlign}`} onClick={(e) => {
    e.stopPropagation();
    onSelect();
  }}>
          {component.runtime_data?.src ? (
            <img src={component.runtime_data.src} alt="이미지" className="inline-block max-w-full h-auto" />
          ) : (
            <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500">이미지 없음</div>
          )}
        </div>
      );

    case constants.edoc.COMPONENT_TYPE_CHECKLIST:
      return (
        <div
          className={`p-2 rounded border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'} cursor-pointer`}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}>
          {(component.runtime_data?.items || []).map((item, i) => (
            <label key={i} className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => onRuntimeDataChange?.(i, e.target.checked)}
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
