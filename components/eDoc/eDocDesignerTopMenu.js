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
                    general-bg-color 
                    flex 
                    items-center 
                    justify-center">
      <button
        onClick={onNewDocument}
        className="bg-blue-400 
                   text-white
                   text-center 
                   rounded 
                   px-2
                   hover:bg-blue-600"
      >
        New Doc.
      </button>
      <button
        onClick={onOpenDocument}
        className="bg-sky-400 
                   text-white
                   text-center 
                   rounded 
                   ml-1 
                   px-2
                   hover:bg-sky-600"
      >
        Open Doc.
      </button>
      <button
        onClick={onSaveDocument}
        className="bg-yellow-400 
                   text-white 
                   text-center
                   rounded 
                   ml-1 
                   px-2
                   hover:bg-yellow-600"
      >
        Save Doc.
      </button>
      <button
        onClick={onDeleteDocument}
        className="bg-red-400 
                   text-white 
                   text-center
                   rounded 
                   ml-1 
                   px-2
                   hover:bg-red-600"
      >
        Del. Doc.
      </button>
      <button 
        onClick={onAddPage}
        className="bg-green-400 
                   text-white 
                   text-center
                   rounded 
                   ml-2
                   px-2
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
                   ml-1 
                   px-2
                   hover:bg-pink-600"
      >
        Del. Page
      </button>
      <button
        onClick={onExportPdf}
        className="bg-purple-400 
                   text-white 
                   text-center
                   rounded 
                   ml-1 
                   px-2
                   hover:bg-purple-600"
      >
        Exp. PDF
      </button>     
    </div>
  );
}