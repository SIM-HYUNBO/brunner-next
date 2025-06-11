// components/edoc/TopMenu.js
import React from 'react';

export default function TopMenu({
  onNewDocument,
  onOpenDocument,
  onSaveDocument,
  onExportPdf,
}) {
  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-300 p-3 shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          onClick={onNewDocument}
        >
          새 문서
        </button>
        <button
          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
          onClick={onOpenDocument}
        >
          문서 열기
        </button>
        <button
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          onClick={onSaveDocument}
        >
          저장
        </button>
        <button
          className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
          onClick={onExportPdf}
        >
          PDF로 출력
        </button>
      </div>
    </div>
  );
}