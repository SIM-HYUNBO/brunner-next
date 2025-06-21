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

  // 🔧 줄 나누기 로직 (idx 배열 반환)
  const splitIntoRows = (comps) => {
    const rows = [];
    let currentRow = [];
    let currentRowWidth = 0;

    comps.forEach((comp, idx) => {
      const width = parseInt(comp.runtime_data?.width ?? 100);
      const forceNewLine = comp.runtime_data?.forceNewLine ?? false;

      if (forceNewLine || currentRowWidth + width > 100) {
        if (currentRow.length > 0) rows.push(currentRow);
        currentRow = [];
        currentRowWidth = 0;
      }

      currentRow.push(idx);
      currentRowWidth += width;
    });

    if (currentRow.length > 0) rows.push(currentRow);
    return rows;
  };

  const handleRuntimeDataChange = (componentIdx, newData) => {
    const component = components[componentIdx];
    const currentData = component.runtime_data || {};
    let newRuntimeData = { ...currentData };

    // 타입별 업데이트
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

    const updatedComponent = {
      ...component,
      runtime_data: newRuntimeData,
    };

    // 🔄 forceNewLine OFF일 때 줄 이동
    const wasNewLine = currentData.forceNewLine === true;
    const isNewLine = newRuntimeData.forceNewLine === true;

    if (wasNewLine && !isNewLine) {
      const rows = splitIntoRows(components);
      const currentRowIdx = rows.findIndex((row) =>
        row.includes(componentIdx)
      );

      if (currentRowIdx > 0) {
        const prevRow = rows[currentRowIdx - 1];
        const prevRowWidth = prevRow.reduce((sum, i) => {
          return sum + parseInt(components[i].runtime_data?.width ?? 100);
        }, 0);
        const currWidth = parseInt(newRuntimeData.width ?? 100);

        if (prevRowWidth + currWidth <= 100) {
          // 줄 이동 가능 → 위치 재조정
          const newList = [...components];
          newList.splice(componentIdx, 1); // 제거
          const insertPos = prevRow[prevRow.length - 1] + 1;
          newList.splice(insertPos, 0, updatedComponent); // 붙이기

          onUpdateComponent(insertPos, newList[insertPos]);
          return;
        }
      }
    }

    onUpdateComponent(componentIdx, updatedComponent);
  };

  // 🔽 줄 단위 렌더링
  const renderComponents = () => {
    const justifyMap = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end',
    };

    const padding = documentRuntimeData?.padding ?? 24;
    const rows = [];

    let currentRow = [];
    let currentRowWidth = 0;

    components.forEach((comp, idx) => {
      const width =
        typeof comp.runtime_data?.width === 'string'
          ? parseInt(comp.runtime_data.width)
          : comp.runtime_data?.width ?? 100;
      const forceNewLine = comp.runtime_data?.forceNewLine ?? false;

      if (forceNewLine || currentRowWidth + width > 100) {
        if (currentRow.length > 0) rows.push(currentRow);
        currentRow = [];
        currentRowWidth = 0;
      }

      currentRow.push({ comp, idx, width });
      currentRowWidth += width;
    });

    if (currentRow.length > 0) rows.push(currentRow);

    return rows.map((row, rowIdx) => {
      const align =
        documentRuntimeData?.positionAlign || 'left';
      const justifyContent = justifyMap[align];

      return (
        <div
          key={rowIdx}
          className="flex w-full mb-2 gap-2"
          style={{ justifyContent }}
        >
          {row.map(({ comp, idx, width }) => {
            const componentWidth =
              typeof comp.runtime_data?.width === 'string'
                ? comp.runtime_data.width
                : `${width}%`;

            return (
              <div
                key={idx}
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
                    handleRuntimeDataChange(
                      idx,
                      args.length === 1 ? args[0] : args
                    )
                  }
                  documentRuntimeData={documentRuntimeData}
                />
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div
      id="editor-canvas"
      className="min-h-[500px] border border-dashed border-gray-400 p-4 rounded w-full"
      onClick={() => onComponentSelect(null)}
      style={{
        padding: documentRuntimeData?.padding ?? 24,
        backgroundColor: documentRuntimeData?.backgroundColor || '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {components?.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">
          좌측에서 컴포넌트를 추가하세요.
        </p>
      ) : (
        renderComponents()
      )}
    </div>
  );
}
