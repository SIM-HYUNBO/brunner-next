"use strict";

import React from "react";
import { Input, Button, Table } from "antd";

// ✅ 사용할 한글 + 영문 폰트 리스트
export const availableFonts = [
  // Sans-serif 계열
  "Arial",
  "Helvetica",
  "Verdana",
  "Trebuchet MS",
  "Noto Sans KR",
  "Pretendard",
  "Spoqa Han Sans Neo",

  // Serif 계열
  "Times New Roman",
  "Georgia",
  "Noto Serif KR",
  "Nanum Myeongjo",

  // Monospace
  "Courier New",
  "Source Code Pro",

  // 기타 한글 무료 웹폰트
  "Nanum Gothic",
  "Gothic A1",
  "IBM Plex Sans KR",
  "SUIT",
  "Dongle",
  "Do Hyeon",
  "Yeon Sung",
];

export default function EDocTextStyleEditor({
  fontFamily,
  fontSize,
  fontWeight,
  underline,
  fontColor,
  backgroundColor,
  onChange,
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">폰트</label>
        <select
          value={fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full border rounded p-2"
        >
          {availableFonts.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">크기(px)</label>
        <input
          type="number"
          value={fontSize}
          min="8"
          max="72"
          onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={fontWeight === "bold"}
            onChange={(e) =>
              onChange({ fontWeight: e.target.checked ? "bold" : "normal" })
            }
          />
          <span>굵게</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={underline}
            onChange={(e) => onChange({ underline: e.target.checked })}
          />
          <span>밑줄</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">폰트 색상</label>
        <input
          type="color"
          value={fontColor}
          onChange={(e) => onChange({ fontColor: e.target.value })}
          className="w-full h-10 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">배경 색상</label>
        <input
          type="color"
          value={
            backgroundColor === "transparent"
              ? "#ffffff" // 체크 시 표시용 기본색
              : backgroundColor
          }
          onChange={(e) => onChange({ backgroundColor: e.target.value })}
          className="w-full h-10 border rounded mb-2"
          disabled={backgroundColor === "transparent"} // 투명 선택 시 색상 선택 비활성
        />

        <label className="inline-flex items-center gap-1">
          <input
            type="checkbox"
            checked={backgroundColor === "transparent"}
            onChange={(e) =>
              onChange({
                backgroundColor: e.target.checked ? "transparent" : "#ffffff", // 체크 시 투명, 해제 시 기본색
              })
            }
            className="mr-2"
          />
          Transparent
        </label>
      </div>
    </div>
  );
}
