import React from 'react';

export default function EDocTopMenu({
  onNewDocument,
  onOpenDocument,
  onSaveDocument,
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
        열기
      </button>
      <button
        onClick={onSaveDocument}
        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        저장
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