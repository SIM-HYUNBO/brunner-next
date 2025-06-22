`use strict`

import React from 'react';
import * as constants from '@/components/constants'
/*
 * EDocComponentPalette.js
 * 컴포넌트 템플릿을 보여주는 팔레트 컴포넌트
 */
export default function EDocComponentPalette({ templates, onAddComponent }) {
  if (!templates || templates.length === 0) {
    return <div>컴포넌트 템플릿을 불러오는 중입니다...</div>;
  }

  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <button
          key={template.id}
          className="w-full text-left p-2 rounded border border-gray-300 hover:bg-gray-50"
          onClick={() => {
            onAddComponent(template);
          }}
        >
          {template.name} ({template.type})
        </button>
      ))}
    </div>
  );
}