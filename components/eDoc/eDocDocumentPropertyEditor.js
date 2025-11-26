"use strict";

import React, { useState, useEffect } from "react";
import * as constants from "@/components/core/constants";

export default function EDocDocumentPropertyEditor({
  runtimeData,
  onChangeRuntimeData,
}) {
  // 로컬 상태 사용 (초기값 동기화)
  const [localData, setLocalData] = useState({
    title: "",
    backgroundColor: "#ffffff",
    isPublic: false,
    padding: 1,
    ...runtimeData,
  });

  // runtimeData 변경 시 로컬 상태 최신화
  useEffect(() => {
    setLocalData((prev) => ({
      ...prev,
      ...runtimeData,
    }));
  }, [runtimeData]);

  // blur 시 원본 업데이트 (최종 저장)
  const commitChange = (key) => {
    if (localData[key] !== runtimeData[key]) {
      onChangeRuntimeData({
        ...runtimeData,
        [key]: localData[key],
      });
    }
  };

  return (
    <div>
      <section className="mb-6 border rounded shadow-sm">
        <h6 className="text-lg mb-3">Document</h6>

        {/* Title */}
        <label className="general-text-bg-color">Title</label>
        <input
          type="text"
          value={localData.title || constants.General.EmptyString}
          onChange={(e) =>
            setLocalData((prev) => ({ ...prev, title: e.target.value }))
          }
          onBlur={() => commitChange("title")}
          className="w-full border border-gray-300 rounded p-2 mb-3"
          placeholder="문서 제목 입력"
        />

        {/* Public */}
        <label className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={!!localData.isPublic}
            onChange={(e) =>
              setLocalData((prev) => ({
                ...prev,
                isPublic: e.target.checked,
              }))
            }
            onBlur={() => commitChange("isPublic")}
            className="mr-2"
          />
          Public Document
        </label>

        {/* Background Color */}
        <label>Document Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={
              localData.backgroundColor === "transparent"
                ? "#ffffff"
                : localData.backgroundColor || "#ffffff"
            }
            onChange={(e) =>
              setLocalData((prev) => ({
                ...prev,
                backgroundColor: e.target.value,
              }))
            }
            onBlur={() => commitChange("backgroundColor")}
            disabled={localData.backgroundColor === "transparent"}
            className="w-10 h-10 p-1 border border-gray-300 rounded"
          />

          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={localData.backgroundColor === "transparent"}
              onChange={(e) => {
                const val = e.target.checked ? "transparent" : "#ffffff";
                setLocalData((prev) => ({
                  ...prev,
                  backgroundColor: val,
                }));
              }}
              onBlur={() => commitChange("backgroundColor")}
            />
            Transparent
          </label>
        </div>

        {/* Padding */}
        <label>Padding(px)</label>
        <input
          type="number"
          min="0"
          value={localData.padding || 1}
          onChange={(e) =>
            setLocalData((prev) => ({
              ...prev,
              padding: parseInt(e.target.value, 10) || 0,
            }))
          }
          onBlur={() => commitChange("padding")}
          className="w-full border border-gray-300 rounded p-2 mb-3"
          placeholder="문서 여백(px)"
        />
      </section>
    </div>
  );
}
