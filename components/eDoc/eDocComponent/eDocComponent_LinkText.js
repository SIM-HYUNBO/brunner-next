"use strict";

import React from "react";
import EDocTextStyleEditor from "@/components/eDoc/eDocTextStyleEditor";
import { Select } from "antd";

// 기본 runtime 데이터 초기화
export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.content = "여기에 링크 텍스트를 설정하세요";
  defaultRuntimeData.url = "https://example.com"; // 기본 링크
  defaultRuntimeData.textAlign = "left";
  defaultRuntimeData.positionAlign = "left";

  // font 관련 기본 설정
  defaultRuntimeData.fontFamily = "Arial";
  defaultRuntimeData.fontSize = 12;
  defaultRuntimeData.underline = true; // 링크는 밑줄 기본
  defaultRuntimeData.fontColor = "#1a0dab"; // 일반 링크 색
  defaultRuntimeData.backgroundColor = "transparent";
  defaultRuntimeData.fontWeight = "normal";

  return defaultRuntimeData;
};

// runtime 데이터 업데이트
export const getNewRuntimeData = (component, { key, value }) => {
  return {
    ...(component.runtime_data || {}),
    [key]: value,
  };
};

// 속성 패널 렌더링
export function renderProperty(
  component,
  updateRuntimeData,
  renderWidthProperty,
  renderForceNewLineProperty,
  renderPositionAlignProperty
) {
  return (
    <div>
      <label>링크 텍스트:</label>
      <input
        type="text"
        value={component.runtime_data?.content || constants.General.EmptyString}
        onChange={(e) => updateRuntimeData("content", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />

      <label>URL:</label>
      <input
        type="text"
        value={component.runtime_data?.url || constants.General.EmptyString}
        onChange={(e) => updateRuntimeData("url", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
        placeholder="https://example.com"
      />

      <label>내용 정렬:</label>
      <Select
        value={component.runtime_data?.textAlign || "left"}
        onChange={(e) => updateRuntimeData("textAlign", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      >
        <option value="left">왼쪽</option>
        <option value="center">가운데</option>
        <option value="right">오른쪽</option>
      </Select>

      {renderWidthProperty()}
      {renderForceNewLineProperty()}
      {renderPositionAlignProperty()}

      <EDocTextStyleEditor
        fontFamily={component.runtime_data?.fontFamily || "Arial"}
        fontSize={component.runtime_data?.fontSize || 12}
        fontWeight={component.runtime_data?.fontWeight || "normal"}
        underline={component.runtime_data?.underline || true}
        fontColor={component.runtime_data?.fontColor || "#1a0dab"}
        backgroundColor={
          component.runtime_data?.backgroundColor || "transparent"
        }
        onChange={(updatedProps) => {
          Object.entries(updatedProps).forEach(([key, value]) => {
            updateRuntimeData(key, value);
          });
        }}
      />
    </div>
  );
}

// 렌더링 컴포넌트
export default function RenderComponent(props) {
  const {
    component,
    handleComponentClick,
    selectedClass,
    alignmentClass,
    textAlign,
    isDesignMode,
  } = props;

  const {
    fontFamily,
    fontSize,
    fontWeight,
    underline,
    fontColor,
    backgroundColor,
    content,
    url,
  } = component.runtime_data || {};

  const style = {
    width: "100%",
    textAlign,
    fontFamily: fontFamily || "Arial",
    fontSize: fontSize ? `${fontSize}px` : "12px",
    fontWeight: fontWeight || "normal",
    textDecoration: underline ? "underline" : "none",
    color: fontColor || "#1a0dab",
    backgroundColor: backgroundColor || "transparent",
    cursor: isDesignMode ? "pointer" : "text",
  };

  if (isDesignMode) {
    // 디자인 모드: 텍스트 클릭 시 편집
    return (
      <p
        className={`${selectedClass} ${alignmentClass} whitespace-pre-wrap overflow-visible`}
        style={style}
        onClick={handleComponentClick}
      >
        {content}
      </p>
    );
  }

  // 일반 모드: 링크 클릭 시 새 탭 열기
  return (
    <a
      href={url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`${selectedClass} ${alignmentClass} whitespace-pre-wrap`}
      style={style}
    >
      {content}
    </a>
  );
}
