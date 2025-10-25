"use strict";

import React, { useEffect } from "react";
import * as constants from "@/components/core/constants";
import DocComponentRenderer from "@/components/eDoc/eDocComponentRenderer";
import { Input, Button, Table } from "antd";

export default function EDocEditorCanvas({
  documentData,
  pageData,
  isSelected,
  onSelect,
  selectedComponentId,
  onComponentSelect,
  onDeleteComponent,
  onMoveUp,
  onMoveDown,
  onUpdateComponent,
  isViewerMode = false,
  mode,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (!isViewerMode && typeof onComponentSelect === "function") {
          onComponentSelect(null);
        }
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onComponentSelect]);

  function getPageDimensionsPx(pageSize) {
    switch (pageSize) {
      case "A3":
        return { width: 1123, height: 1587 };
      case "Letter":
        return { width: 816, height: 1056 };
      case "A4":
      default:
        return { width: 794, height: 1123 };
    }
  }

  const { width: pageWidthPx, height: pageHeightPx } = getPageDimensionsPx(
    pageData.runtime_data?.pageSize || "A4"
  );

  const justifyMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

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
    const component = pageData.components[componentIdx];
    const newRuntimeData = newData.runtime_data;

    const updatedComponent = {
      ...component,
      runtime_data: newRuntimeData,
    };

    if (typeof onUpdateComponent === "function") {
      onUpdateComponent(updatedComponent);
    }
  };

  const RenderComponents = () => {
    const comps =
      pageData.components.length > 0
        ? [
            {
              ...pageData.components[0],
              runtime_data: {
                ...pageData.components[0].runtime_data,
                forceNewLine: true,
              },
            },
            ...pageData.components.slice(1),
          ]
        : [];

    const rows = splitIntoRows(comps);

    return rows.map((row, rowIdx) => {
      return (
        <div
          key={rowIdx}
          className="flex mb-2 gap-2 w-full"
          style={{
            maxWidth: `calc(${pageWidthPx}px - ${
              (pageData.runtime_data?.padding ?? 24) * 2
            }px)`,
          }}
        >
          {row.map((compIdx) => {
            const comp = comps[compIdx];
            const widthRaw = comp.runtime_data?.width;
            const componentWidth =
              typeof widthRaw === "string"
                ? widthRaw
                : `${parseInt(widthRaw ?? 100)}%`;

            const align = comp.runtime_data?.positionAlign || "left";
            const justifyContent = justifyMap[align] || "flex-start";

            return (
              <div
                key={compIdx}
                className="flex w-full"
                style={{ justifyContent }}
              >
                <div
                  className={`relative group rounded ${
                    isViewerMode
                      ? ""
                      : selectedComponentId === compIdx
                      ? "border-2 border-blue-500"
                      : "border border-transparent hover:border-gray-300"
                  }`}
                  style={{ width: componentWidth }}
                >
                  {!isViewerMode && selectedComponentId === compIdx && (
                    <div
                      className="opacity-80 
                                    left-0 
                                    top-1/2 
                                    -translate-y-1/2 
                                    flex 
                                    flex-row 
                                    pointer-events-auto 
                                    text-xs 
                                    bg-white 
                                    border 
                                    rounded 
                                    shadow 
                                    items-center 
                                    justify-center 
                                    gap-1 
                                    absolute z-10"
                    >
                      <Button
                        onClick={() => onMoveUp(compIdx)}
                        disabled={compIdx === 0}
                        className="hover:bg-gray-100 text-sm px-1 py-0.5 transition-opacity duration-200"
                        style={{ width: "16px", height: "20px", opacity: 1 }}
                      >
                        ↑
                      </Button>
                      <Button
                        onClick={() => onMoveDown(compIdx)}
                        disabled={compIdx === comps.length - 1}
                        className="hover:bg-gray-100 text-sm px-1 py-0.5 transition-opacity duration-200"
                        style={{ width: "16px", height: "20px", opacity: 1 }}
                      >
                        ↓
                      </Button>
                      <Button
                        onClick={() => onDeleteComponent(compIdx)}
                        className="hover:bg-gray-100 text-red-600 text-sm px-1 py-0.5 transition-opacity duration-200"
                        style={{ width: "16px", height: "20px", opacity: 1 }}
                      >
                        🗑
                      </Button>
                    </div>
                  )}

                  <DocComponentRenderer
                    component={comp}
                    isSelected={
                      !isViewerMode && selectedComponentId === compIdx
                    }
                    onSelect={() => {
                      if (!isViewerMode) {
                        onSelect?.();
                        onComponentSelect?.(compIdx);
                      }
                    }}
                    onRuntimeDataChange={(...args) =>
                      updateRuntimeData(
                        compIdx,
                        args.length === 1 ? args[0] : args
                      )
                    }
                    mode={mode}
                    pageData={pageData}
                    documentData={documentData}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    // 페이지간 간격 1 고정
    <div
      className={`overflow-x-auto 
                     flex 
                     w-full 
                     justify-center
                     ${isSelected ? "outline outline-2 outline-blue-400" : ""}`}
      style={{
        marginTop: `${
          pageData.runtime_data?.pageMargin
            ? pageData.runtime_data?.pageMargin
            : 0
        }px`,
      }}
    >
      <div
        id={`editor-canvas-${pageData.id}`}
        className={`border 
                   border-gray-300 
                   dark:border-white 
                   border-dashed 
                   border-1`}
        style={{
          width: `${pageWidthPx}px`,
          minHeight: `${pageHeightPx}px`,
          padding: `${pageData.runtime_data?.padding ?? 48}px`,
          boxSizing: "border-box",
          backgroundColor: pageData.runtime_data?.backgroundColor || "#f8f8f8",
        }}
        onClick={onSelect}
      >
        {pageData.components?.length === 0 ? (
          isViewerMode ? null : (
            <p className="text-center">Add components from left.</p>
          )
        ) : (
          RenderComponents()
        )}
      </div>
    </div>
  );
}
