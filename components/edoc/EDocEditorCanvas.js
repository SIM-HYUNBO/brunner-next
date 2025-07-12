'use strict'

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
  isViewerMode = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (!isViewerMode && typeof onComponentSelect === 'function') {
          onComponentSelect(null);
        }
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComponentSelect]);

  // ✅ getPageDimensionsPx만 사용!
  function getPageDimensionsPx(pageSize) {
    switch (pageSize) {
      case "A3":
        return { width: 1123, height: 1587 }; // 297mm x 420mm @ 96dpi
      case "Letter":
        return { width: 816, height: 1056 }; // 8.5in x 11in @ 96dpi
      case "A4":
      default:
        return { width: 794, height: 1123 }; // 210mm x 297mm @ 96dpi
    }
  }

  const { width: pageWidthPx, height: pageHeightPx } = getPageDimensionsPx(
    documentRuntimeData?.pageSize || "A4"
  );

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
      case constants.edoc.COMPONENT_TYPE_TABLE:
        newRuntimeData = TableComponent.getNewRuntimeData(component, newData);
        break;
      case constants.edoc.COMPONENT_TYPE_CHECKLIST:
        newRuntimeData = CheckListComponent.getNewRuntimeData(component, newData);
        break;
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
          if (typeof onUpdateComponent === 'function') {
            onUpdateComponent(newList[insertPos]);
          }
          return;
        }
      }
    }

    if (typeof onUpdateComponent === 'function') {
      onUpdateComponent(updatedComponent);
    }
  };

  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  const renderComponents = () => {
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
      const firstCompInRow = comps[row[0]];
      const rowAlign = firstCompInRow.runtime_data?.positionAlign || documentRuntimeData?.positionAlign || 'left';
      const justifyContent = justifyMap[rowAlign] || 'flex-start';

      return (
        <div
          key={rowIdx}
          className="flex mb-2 gap-2"
          style={{
            maxWidth: `calc(${pageWidthPx}px - ${documentRuntimeData?.padding ?? 24 * 2}px)`,
            justifyContent: justifyContent,
            overflow: "hidden",
          }}
        >
          {row.map((compIdx, idx) => {
            const comp = comps[compIdx];
            const forceNewLine = comp.runtime_data?.forceNewLine ?? false;
            const widthRaw = comp.runtime_data?.width;
            const componentWidth = typeof widthRaw === 'string' ? widthRaw : `${parseInt(widthRaw ?? 100)}%`;

            const style = {
              width: componentWidth,
              marginLeft: idx === 0 ? 0 : forceNewLine ? 0 : '4px',
              flexGrow: 0,
              flexShrink: 0,
            };

            return (
              <div
                key={compIdx}
                className={`relative group p-1 rounded ${
                  isViewerMode ? ''
                    : selectedComponentId === compIdx
                      ? 'border-2 border-blue-500'
                      : 'border border-transparent hover:border-gray-300'
                }`}
                style={style}
              >
                {!isViewerMode && (
                  <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => onMoveUp(compIdx)} disabled={compIdx === 0}>↑</button>
                    <button onClick={() => onMoveDown(compIdx)} disabled={compIdx === comps.length - 1}>↓</button>
                    <button onClick={() => typeof onDeleteComponent === 'function' && onDeleteComponent(compIdx)}>🗑</button>
                  </div>
                )}
                <DocComponentRenderer
                  component={comp}
                  isSelected={!isViewerMode && selectedComponentId === compIdx}
                  onSelect={() => !isViewerMode && typeof onComponentSelect === 'function' && onComponentSelect(compIdx)}
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

  const paddingPx = documentRuntimeData?.padding ?? 24;

  return (
    <div className="overflow-auto flex justify-center p-8 bg-gray-100">
      <div
        id="editor-canvas"
        className="relative border-2 border-dashed border-gray-400 bg-white"
        style={{
          width: `${pageWidthPx}px`,
          minHeight: `${pageHeightPx}px`,
          padding: `${documentRuntimeData?.padding ?? 48}px`, // ← 여기!
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          boxSizing: "border-box", // ← 기본값이지만 안전하게 명시
        }}
        onClick={() => {
          if (!isViewerMode && typeof onComponentSelect === 'function') {
            onComponentSelect(null);
          }
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
    </div>
  );
}