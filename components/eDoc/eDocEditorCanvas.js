'use strict';

import React, { useEffect } from 'react';
import * as constants from '@/components/constants';
import DocComponentRenderer from '@/components/eDoc/eDocComponentRenderer';

export default function EDocEditorCanvas({
  pageData, // ✅ 단일 페이지
  isSelected,
  onSelect,
  selectedComponentId,
  onComponentSelect,
  onDeleteComponent,
  onMoveUp,
  onMoveDown,
  onUpdateComponent,
  isViewerMode = false,
  mode, // design | runtime
  bindingData
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

  function getPageDimensionsPx(pageSize) {
    switch (pageSize) {
      case 'A3':
        return { width: 1123, height: 1587 };
      case 'Letter':
        return { width: 816, height: 1056 };
      case 'A4':
      default:
        return { width: 794, height: 1123 };
    }
  }

  const { width: pageWidthPx, height: pageHeightPx } = getPageDimensionsPx(
    pageData.runtime_data?.pageSize || 'A4'
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
    const component = pageData.components[componentIdx];
    const newRuntimeData = newData.runtime_data;

    const updatedComponent = {
      ...component,
      runtime_data: newRuntimeData,
    };

    if (typeof onUpdateComponent === 'function') {
      onUpdateComponent(updatedComponent);
    }
  };

  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
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

    // 페이지 전체 정렬값으로 통일
    const pageAlign = pageData.runtime_data?.positionAlign || 'left';
    const justifyContent = justifyMap[pageAlign] || 'flex-start';

    return rows.map((row, rowIdx) => {
      return (
        <div
          key={rowIdx}
          className="flex mb-2 gap-2"
          style={{
            maxWidth: `calc(${pageWidthPx}px - ${(pageData.runtime_data?.padding ?? 24) * 2}px)`,
            justifyContent, // 페이지 전체 정렬로 통일
            overflow: 'x-auto',
          }}
        >
          {row.map((compIdx) => {
            const comp = comps[compIdx];
            const widthRaw = comp.runtime_data?.width;
            const componentWidth =
              typeof widthRaw === 'string'
                ? widthRaw
                : `${parseInt(widthRaw ?? 100)}%`;

            return (
              <div
                key={compIdx}
                className={`relative group rounded ${
                  isViewerMode
                    ? ''
                    : selectedComponentId === compIdx
                    ? 'border-2 border-blue-500'
                    : 'border border-transparent hover:border-gray-300'
                }`}
                style={{ width: componentWidth }}
              >
                {!isViewerMode && selectedComponentId === compIdx && (
                  <div className="opacity-80 left-0 top-1/2 -translate-y-1/2 flex flex-row pointer-events-auto text-xs bg-white border rounded shadow items-center justify-center gap-1 absolute z-10">
                    <button
                      onClick={() => onMoveUp(compIdx)}
                      disabled={compIdx === 0}
                      className="hover:bg-gray-100 text-sm px-1 py-0.5 transition-opacity duration-200"
                      style={{ width: '16px', height: '20px', opacity: 1 }}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => onMoveDown(compIdx)}
                      disabled={compIdx === comps.length - 1}
                      className="hover:bg-gray-100 text-sm px-1 py-0.5 transition-opacity duration-200"
                      style={{ width: '16px', height: '20px', opacity: 1 }}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => onDeleteComponent(compIdx)}
                      className="hover:bg-gray-100 text-red-600 text-sm px-1 py-0.5 transition-opacity duration-200"
                      style={{ width: '16px', height: '20px', opacity: 1 }}
                    >
                      🗑
                    </button>
                  </div>
                )}

                <DocComponentRenderer
                  component={comp}
                  isSelected={!isViewerMode && selectedComponentId === compIdx}
                  onSelect={() => {
                    if (!isViewerMode) {
                      onSelect?.(); // ✅ 페이지 선택 먼저
                      onComponentSelect?.(compIdx);
                    }
                  }}
                  onRuntimeDataChange={(...args) =>
                    updateRuntimeData(compIdx, args.length === 1 ? args[0] : args)
                  }
                  mode={mode}
                  bindingData={bindingData}
                  page={pageData}
                />
              </div>
            );
          })}
        </div>
      );
    });
  };

  // 페이지 전체 정렬 클래스
  const pageAlign = pageData.runtime_data?.positionAlign || 'center';
  const outerAlignClass = {
    left: 'items-start justify-start',
    center: 'items-center justify-center',
    right: 'items-end justify-end',
  }[pageAlign];

  return (
    <div className={`overflow-x-auto flex w-full text-slate-800 ${outerAlignClass}`}>
      <div
        id={`editor-canvas-${pageData.id}`}
        className="border border-gray-300 dark:border-white border-dashed border-1"
        style={{
          width: `${pageWidthPx}px`,
          minHeight: `${pageHeightPx}px`,
          padding: `${pageData.runtime_data?.padding ?? 48}px`,
          boxSizing: 'border-box',
          backgroundColor: pageData.runtime_data?.backgroundColor || '#f8f8f8',
        }}
        onClick={onSelect}
      >
        {pageData.components?.length === 0 ? (
          isViewerMode ? null : (
            <p className="text-gray-500 dark:text-slate-300 text-center">
              좌측에서 컴포넌트를 추가하세요.
            </p>
          )
        ) : (
          RenderComponents()
        )}
      </div>
    </div>
  );
}
