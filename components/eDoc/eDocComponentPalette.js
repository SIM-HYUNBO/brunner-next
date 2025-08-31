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
    <div className="space-y-3 mr-1">
      <h2 className="flex justify-center items-center text-lg font-semibold mb-4 general-text-color">컴포넌트</h2>

      {templates.map((template) => (
        <button
          key={template.id}
          className="w-full text-center rounded border border-gray-300 general-text-bg-color"
          onClick={() => {  
            onAddComponent(template);
          }}
        >
          {template.name}({template.type})
        </button>
      ))}
    </div>
  );
}