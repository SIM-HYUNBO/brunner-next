`use strict`

import React, { useEffect } from 'react';
import * as constants from '@/components/constants';
import DocComponentRenderer from '@/components/edoc/EDocComponentRenderer';

import * as InputComponent from "@/components/edoc/edocComponent/edocComponent_Input";
import * as TextComponent from "@/components/edoc/edocComponent/edocComponent_Text";
import * as ImageComponent from "@/components/edoc/edocComponent/edocComponent_Image";
import * as TableComponent from "@/components/edoc/edocComponent/edocComponent_Table";
import * as CheckListComponent from "@/components/edoc/edocComponent/edocComponent_CheckList";

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

  // forceNewLine === true 기준으로 행 나누기
  const splitIntoRows = (comps) => {
    const rows = [];
    let currentRow = [];

    comps.forEach((comp, idx) => {
      const forceNewLine = comp.runtime_data?.forceNewLine ?? false;

      if (forceNewLine && currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
      }
      currentRow.push(idx);
    });

    if (currentRow.length > 0) rows.push(currentRow);
    return rows;
  };

  const updateRuntimeData = (componentIdx, newData) => {
    const component = components[componentIdx];
    const currentData = component.runtime_data || {};
    let newRuntimeData = null;

    switch (component.type) {
      case constants.edoc.COMPONENT_TYPE_TEXT:
        newRuntimeData = TextComponent.getNewRuntimeData(component, newData);
        break;
      case constants.edoc.COMPONENT_TYPE_INPUT:
        newRuntimeData = InputComponent.getNewRuntimeData(component, newData);
        break;
      case constants.edoc.COMPONENT_TYPE_TABLE: {
        newRuntimeData = TableComponent.getNewRuntimeData(component, newData);
        break;
      }
      case constants.edoc.COMPONENT_TYPE_CHECKLIST: {
        newRuntimeData = CheckListComponent.getNewRuntimeData(component, newData);
        break;
      }
      case constants.edoc.COMPONENT_TYPE_IMAGE:
        newRuntimeData = ImageComponent.getNewRuntimeData(component, newData);
        break;
      default:
        newRuntimeData = { ...currentData, ...newData };
    }

    const updatedComponent = {
      ...component,
      runtime_data: newRuntimeData,
    };

    // forceNewLine 변경 시 줄 이동 처리 (이전 행 우측으로 붙이기)
    const wasNewLine = currentData.forceNewLine === true;
    const isNewLine = newRuntimeData.forceNewLine === true;

    if (wasNewLine && !isNewLine) {
      const rows = splitIntoRows(components);
      const currentRowIdx = rows.findIndex((row) => row.includes(componentIdx));

      if (currentRowIdx > 0) {
        const prevRow = rows[currentRowIdx - 1];
        const prevRowWidth = prevRow.reduce((sum, i) => {
          return sum + parseInt(components[i].runtime_data?.width ?? 100);
        }, 0);
        const currWidth = parseInt(newRuntimeData.width ?? 100);

        if (prevRowWidth + currWidth <= 100) {
          const newList = [...components];
          newList.splice(componentIdx, 1);
          const insertPos = prevRow[prevRow.length - 1] + 1;
          newList.splice(insertPos, 0, updatedComponent);

          onUpdateComponent(insertPos, newList[insertPos]);
          return;
        }
      }
    }

    onUpdateComponent(componentIdx, updatedComponent);
  };

  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  const renderComponents = () => {
  // 컴포넌트 리스트 복사 및 첫 컴포넌트 forceNewLine 강제 적용
  const comps = components.length > 0
    ? [
        {
          ...components[0],
          runtime_data: {
            ...components[0].runtime_data,
            forceNewLine: true,
          },
        },
        ...components.slice(1),
      ]
    : [];

  const rows = splitIntoRows(comps);

  return rows.map((row, rowIdx) => {
    // 행 전체 정렬은 첫 번째 forceNewLine 컴포넌트의 positionAlign 사용
    const firstCompInRow = comps[row[0]];
    const rowAlign = firstCompInRow.runtime_data?.positionAlign || documentRuntimeData?.positionAlign || 'left';
    const justifyContent = justifyMap[rowAlign] || 'flex-start';

    return (
      <div
        key={rowIdx}
        className="flex w-full mb-2 gap-2"
        style={{
        minWidth: "800px",    // 문서 최소 폭 (원하는 값)
        width: "fit-content", // 내부 내용만큼 크기
        overflow: "visible",  // 내부 요소가 나가면 부모가 스크롤되도록
      }}
      >
        {row.map((compIdx, idx) => {
          const comp = comps[compIdx];
          const forceNewLine = comp.runtime_data?.forceNewLine ?? false;

          const widthRaw = comp.runtime_data?.width;
          const componentWidth =
            typeof widthRaw === 'string' ? widthRaw : `${parseInt(widthRaw ?? 100)}%`;

          const style = {
            width: componentWidth,
            marginLeft: idx === 0 ? 0 : forceNewLine ? 0 : '4px',
            flexGrow: 0,
            flexShrink: 0,
          };

          return (
            <div
              key={compIdx}
              className="relative group p-1 border border-transparent rounded hover:border-gray-300"
              style={style}
            >
              {/* 툴버튼 */}
              <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  className="text-xs bg-white border rounded shadow px-1 hover:bg-gray-100 disabled:opacity-30"
                  onClick={() => onMoveUp(compIdx)}
                  disabled={compIdx === 0}
                  title="위로 이동"
                >
                  ↑
                </button>
                <button
                  className="text-xs bg-white border rounded shadow px-1 hover:bg-gray-100 disabled:opacity-30"
                  onClick={() => onMoveDown(compIdx)}
                  disabled={compIdx === comps.length - 1}
                  title="아래로 이동"
                >
                  ↓
                </button>
                <button
                  onClick={() => onDeleteComponent(compIdx)}
                  disabled={selectedComponentId === null}
                  title="삭제"
                >
                  🗑
                </button>
              </div>

              <DocComponentRenderer
                component={comp}
                isSelected={selectedComponentId === compIdx}
                onSelect={() => onComponentSelect(compIdx)}
                onRuntimeDataChange={(...args) =>
                  updateRuntimeData(compIdx, args.length === 1 ? args[0] : args)
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
      className="min-h-[500px] border border-dashed border-gray-400 p-4 rounded w-full  overflow-auto"
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
