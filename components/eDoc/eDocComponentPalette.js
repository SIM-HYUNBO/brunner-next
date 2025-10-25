`use strict`;

import React from "react";
import * as constants from "@/components/core/constants";
import { Input, Button, Table } from "antd";

/*
 * EDocComponentPalette.js
 * 컴포넌트 템플릿을 보여주는 팔레트 컴포넌트
 */
export default function EDocComponentPalette({ templates, onAddComponent }) {
  if (!templates || templates.length === 0) {
    return <div>컴포넌트 템플릿을 불러오는 중입니다...</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center space-y-3 mr-1 min-w-20">
      <h5 className="flex mb-16 text-lg general-text-color">Components</h5>
      {templates.map((template) => (
        <Button
          key={template.id}
          className="w-full text-center justify-center items-center rounded border border-gray-300 general-text-bg-color"
          onClick={() => {
            onAddComponent(template);
          }}
        >
          {template.type}
        </Button>
      ))}
    </div>
  );
}
