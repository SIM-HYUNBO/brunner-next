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
    <div className="w-full 
                    bg-slate-100 
                    dark:bg-slate-800 
                    flex 
                    items-center 
                    justify-center 
                    space-x-1">
      <button
        onClick={onNewDocument}
        className="bg-blue-400 
                   text-white
                   text-center 
                   rounded 
                   hover:bg-blue-600"
      >
        New
      </button>
      <button
        onClick={onOpenDocument}
        className="bg-sky-400 
                   text-white
                   text-center 
                   rounded 
                   hover:bg-sky-600"
      >
        Open
      </button>
      <button
        onClick={onSaveDocument}
        className="bg-yellow-400 
                   text-white 
                   text-center
                   rounded 
                   hover:bg-yellow-600"
      >
        Save
      </button>
      <button
        onClick={onDeleteDocument}
        className="bg-red-400 
                   text-white 
                   text-center
                   rounded 
                   ml-2 
                   hover:bg-red-600"
      >
        Delete
      </button>
      <button 
        onClick={onAddPage}
        className="bg-green-400 
                   text-white 
                   text-center
                   rounded 
                   hover:bg-green-600"
      >
        Add Page
      </button>
      <button
        onClick={onDeleteCurrentPage}
        className="bg-pink-400 
                   text-white 
                   text-center
                   rounded 
                   ml-2 
                   hover:bg-pink-600"
      >
        Delete Page
      </button>
      <button
        onClick={onExportPdf}
        className="bg-purple-400 
                   text-white 
                   text-center
                   rounded 
                   hover:bg-purple-600"
      >
        Export PDF
      </button>     
    </div>
  );
}