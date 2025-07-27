'use strict'

import React, { useEffect } from 'react';
import * as constants from '@/components/constants';
import DocComponentRenderer from '@/components/eDoc/eDocComponentRenderer';

export default function EDocEditorCanvas({
  page,                  // ✅ 단일 페이지
  isSelected,            // ✅ 현재 페이지 선택 상태
  onSelect,              // ✅ 페이지 클릭 시 실행
  selectedComponentId,
  onComponentSelect,
  onDeleteComponent,
  onMoveUp,
  onMoveDown,
  onUpdateComponent,
  isViewerMode = false,
  mode,// design | runtime
  bindingData,
  documentData
}) {
  const { components, runtime_data } = page;

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
    runtime_data?.pageSize || "A4"
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
    let newRuntimeData = newData.runtime_data;

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
      const rowAlign = firstCompInRow.runtime_data?.positionAlign || runtime_data?.positionAlign || 'left';
      const justifyContent = justifyMap[rowAlign] || 'flex-start';

      return (
              <div
                key={rowIdx}
                className="flex mb-2 gap-2"
                style={{
                  maxWidth: `calc(${pageWidthPx}px - ${runtime_data?.padding ?? 24 * 2}px)`,
                  justifyContent,
                  overflow: "x-auto",
                }}
              >
              {row.map((compIdx) => {
                const comp = comps[compIdx];
                const widthRaw = comp.runtime_data?.width;
                const componentWidth = typeof widthRaw === 'string' ? widthRaw : `${parseInt(widthRaw ?? 100)}%`;

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
                    style={{ width: '16px', height: '20px', opacity:1 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={e => (e.currentTarget.style.opacity = 1)}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => onMoveDown(compIdx)}
                    disabled={compIdx === comps.length - 1}
                    className="hover:bg-gray-100  text-sm px-1 py-0.5 transition-opacity duration-200"
                    style={{ width: '16px', height: '20px', opacity: 1 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={e => (e.currentTarget.style.opacity = 1)}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => onDeleteComponent(compIdx)}
                    className="hover:bg-gray-100 text-red-600 text-sm px-1 py-0.5 transition-opacity duration-200"
                    style={{ width: '16px', height: '20px', opacity: 1}}
                    onMouseEnter={e => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={e => (e.currentTarget.style.opacity = 1)}
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
                  onSelect?.(); // ✅ 페이지 선택 먼저!
                  onComponentSelect?.(compIdx); // ✅ 그 다음 컴포넌트 선택!
                }
              }}
              onRuntimeDataChange={(...args) =>
                updateRuntimeData(compIdx, args.length === 1 ? args[0] : args)
              }
              documentRuntimeData={runtime_data}
              mode={mode}
              bindingData={bindingData}
              documentData={documentData}
            />
          </div>
          );
        })}
      </div>
      );
    });
  };

return (
  // 모바일에서 문서 내용이 가로로 넘처서 삐져나오는 경우가 많은데 이경우 가로 스크롤로 봐야함.
  <div className="overflow-x-auto flex flex-col w-full desktop:flex-row bg-white text-slate-800 items-center justify-center"> 
    <div
      id={`editor-canvas-${page.id}`}
      className="border border-gray-300 dark:border-white border-dashed border-6"
      style={{
        width: `${pageWidthPx}px`,
        minHeight: `${pageHeightPx}px`,
        padding: `${runtime_data?.padding ?? 48}px`,
        boxSizing: "border-box",
        backgroundColor: runtime_data?.backgroundColor || '#ffffff',
      }}
      onClick={onSelect}
    >
      {components?.length === 0 ? (
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
