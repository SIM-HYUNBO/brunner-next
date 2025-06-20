import React, { useEffect } from 'react';
import * as constants from '@/components/constants';
import DocComponentRenderer from '@/components/edoc/EDocComponentRenderer';

export default function EDocEditorCanvas({
  components,
  selectedComponentId,
  onComponentSelect,
  onDeleteComponent,
  onMoveUp,
  onMoveDown,
  onUpdateComponent,
  documentRuntimeData,
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

  const layoutRows = [];
  let currentRow = [];
  let remainingWidth = 100;
  const padding = documentRuntimeData?.padding ?? 24;

  components.forEach((comp, idx) => {
    let compWidth = 100;
    if (typeof comp.runtime_data?.width === 'string' && comp.runtime_data.width.endsWith('%')) {
      compWidth = parseInt(comp.runtime_data.width);
    } else if (typeof comp.runtime_data?.width === 'number') {
      compWidth = comp.runtime_data.width;
    }
    const forceNewLine = comp.runtime_data?.forceNewLine ?? false;

    if (forceNewLine || remainingWidth - compWidth < 0) {
      if (currentRow.length > 0) layoutRows.push(currentRow);
      currentRow = [{ comp, idx }];
      remainingWidth = 100 - compWidth;
    } else {
      currentRow.push({ comp, idx });
      remainingWidth -= compWidth;
    }
  });
  if (currentRow.length > 0) layoutRows.push(currentRow);

  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  return (
    <div
      id="editor-canvas"
      className="min-h-[500px] border border-dashed border-gray-400 p-4 rounded w-full"
      onClick={() => onComponentSelect(null)}
      style={{
        padding,
        backgroundColor: documentRuntimeData?.backgroundColor || '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {(!components || components.length === 0) && (
        <p className="text-gray-500 text-center mt-20">좌측에서 컴포넌트를 추가하세요.</p>
      )}

      {layoutRows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex flex-wrap gap-2 mb-4 w-full">
          {row.map(({ comp, idx }) => {
            const positionAlign = comp.runtime_data?.positionAlign || 'left';
            const justifyContent = justifyMap[positionAlign] || 'flex-start';
            const componentWidth =
              typeof comp.runtime_data?.width === 'string'
                ? comp.runtime_data.width
                : `${comp.runtime_data?.width ?? 100}%`;

            return (
              <div
                key={idx}
                style={{ display: 'flex', justifyContent, width: '100%' }}
              >
                <div
                  className="relative group p-1 border border-transparent rounded hover:border-gray-300"
                  style={{ width: componentWidth }}
                >
                  {/* 툴버튼 */}
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
                    onRuntimeDataChange={(...args) =>
                      handleRuntimeDataChange(idx, args.length === 1 ? args[0] : args)
                    }
                    documentRuntimeData={documentRuntimeData}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
