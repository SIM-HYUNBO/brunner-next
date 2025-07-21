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
    <div className="w-full bg-slate-100 dark:bg-slate-800 py-2 flex items-center justify-center desktop:justify-left space-x-1 desktop:pr-80">
      <button
        onClick={onNewDocument}
        className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-600"
      >
        New
      </button>
      <button
        onClick={onOpenDocument}
        className="px-3 py-1 bg-sky-400 text-white rounded hover:bg-sky-600"
      >
        Open
      </button>
      <button
        onClick={onSaveDocument}
        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-600"
      >
        Save
      </button>
      <button
        onClick={onDeleteDocument}
        className="px-3 py-1 bg-red-400 text-white rounded ml-2 hover:bg-red-600"
      >
        Delete
      </button>
      <button 
        onClick={onAddPage}
        className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-600"
      >
        Add Page
      </button>
      <button
        onClick={onDeleteCurrentPage}
        className="px-3 py-1 bg-pink-400 text-white rounded ml-2 hover:bg-pink-600"
      >
        Delete Page
      </button>
      <button
        onClick={onExportPdf}
        className="px-3 py-1 bg-purple-400 text-white rounded hover:bg-purple-600"
      >
        Export PDF
      </button>     
    </div>
  );
}