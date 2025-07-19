`use strict`

import React from 'react';

/**
 * EDocTopMenu.js
 * EDoc 상단 메뉴 컴포넌트
 * 새문서, 열기, 저장, PDF 출력 버튼을 포함
 */
export default function EDocDesignerTopMenu({
  onNewDocument,
  onOpenDocument,
  onSaveDocument,
  onDeleteDocument,
  onAddPage,
  onDeleteCurrentPage,
  onExportPdf
}) {
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 px-4 py-2 flex items-center justify-center space-x-1">
      <button
        onClick={onNewDocument}
        className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-600"
      >
        새문서
      </button>
      <button
        onClick={onOpenDocument}
        className="px-3 py-1 bg-sky-400 text-white rounded hover:bg-sky-600"
      >
        문서 열기
      </button>
      <button
        onClick={onSaveDocument}
        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-600"
      >
        문서 저장
      </button>
      <button
        onClick={onDeleteDocument}
        className="px-3 py-1 bg-red-400 text-white rounded ml-2 hover:bg-red-600"
      >
        문서 삭제
      </button>
      <button 
        onClick={onAddPage}
        className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-600"
      >
        페이지 추가
      </button>
      <button
        onClick={onDeleteCurrentPage}
        className="px-3 py-1 bg-pink-400 text-white rounded ml-2 hover:bg-pink-600"
      >
        현재 페이지 삭제
      </button>
      <button
        onClick={onExportPdf}
        className="px-3 py-1 bg-purple-400 text-white rounded hover:bg-purple-600"
      >
        PDF 출력
      </button>     
    </div>
  );
}