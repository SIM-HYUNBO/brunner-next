"use strict";

import React, { useState } from "react";
import { Input, Button, Table } from "antd";

export default function EDocDocumentPropertyEditor({
  runtimeData,
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
      <section className="mb-6 border rounded shadow-sm">
        <h2 className="text-lg font-semibold mb-3">문서 속성</h2>

        <label className="general-text-bg-color">Title</label>
        <input
          type="text"
          value={runtimeData.title || ""}
          onChange={(e) => updateProperty("title", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-3"
          placeholder="문서 제목 입력"
        />

        <label className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={!!runtimeData.isPublic}
            onChange={(e) => updateProperty("isPublic", e.target.checked)}
            className="mr-2"
          />
          Public Document
        </label>

        <label>Document Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={
              runtimeData.backgroundColor === "transparent"
                ? "#ffffff" // 투명일 때 기본 표시 색
                : runtimeData.backgroundColor || "#ffffff"
            }
            onChange={(e) => updateProperty("backgroundColor", e.target.value)}
            disabled={runtimeData.backgroundColor === "transparent"} // 투명일 때는 비활성화
            className="w-10 h-10 p-1 border border-gray-300 rounded"
          />

          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={runtimeData.backgroundColor === "transparent"}
              onChange={(e) =>
                updateProperty(
                  "backgroundColor",
                  e.target.checked ? "transparent" : "#ffffff"
                )
              }
            />
            Transparent
          </label>
        </div>
        <label>문서 여백 (px)</label>
        <input
          type="number"
          min="0"
          value={runtimeData.padding || 1}
          onChange={(e) =>
            updateProperty("padding", parseInt(e.target.value, 10) || 0)
          }
          className="w-full border border-gray-300 rounded p-2 mb-3"
          placeholder="문서 여백(px)"
        />
      </section>
    </div>
  );
}
