'use strict'

import React, { useState } from 'react';

export default function EDocDocumentPropertyEditor({
  runtimeData,
  onChangeTitle,
  onChangeIsPublic,
  onChangeDocumentBackgroundColor,
  onChangeRuntimeData,
}) {
  const updateProperty = (key, value) => {
    onChangeRuntimeData({
      ...runtimeData,
      [key]: value,
    });
  };

  return (
    <div>
      {/* 문서 속성 영역 */}
      <section className="mb-6 p-4 border rounded shadow-sm">
        <h2 className="text-lg font-semibold mb-3">문서 속성</h2>

        <label>Title</label>
        <input
          type="text"
          value={runtimeData.title || ''}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-3"
          placeholder="문서 제목 입력"
        />

        <label className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={!!runtimeData.isPublic}
            onChange={(e) => onChangeIsPublic(e.target.checked)}
            className="mr-2"
          />
          Public Document
        </label>

        <label>Document Background Color</label>
        <input
          type="color"
          value={runtimeData.backgroundColor || '#ffffff'}
          onChange={(e) =>
            updateProperty('backgroundColor', e.target.value)
          }
          className="w-full h-10 p-1 mb-3 border border-gray-300 rounded"
        />

        <label>문서 여백 (px)</label>
        <input
          type="number"
          min="0"
          value={runtimeData.padding || 1}
          onChange={(e) =>
            updateProperty('padding', parseInt(e.target.value, 10) || 0)
          }
          className="w-full border border-gray-300 rounded p-2 mb-3"
          placeholder="문서 여백(px)"
        />
      </section>
    </div>
  );
}