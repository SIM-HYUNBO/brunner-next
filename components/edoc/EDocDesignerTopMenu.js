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
  onExportPdf
}) {
  return (
    <div className="w-full bg-white border-b border-gray-300 px-4 py-2 flex items-center space-x-4">
      <button
        onClick={onNewDocument}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        새문서
      </button>
      <button
        onClick={onOpenDocument}
        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      >
        문서 열기
      </button>
      <button
        onClick={onSaveDocument}
        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        문서 저장
      </button>
      <button
        onClick={onDeleteDocument}
        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        문서 삭제
      </button>
      <button
        onClick={onExportPdf}
        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        PDF 출력
      </button>     
    </div>
  );
}