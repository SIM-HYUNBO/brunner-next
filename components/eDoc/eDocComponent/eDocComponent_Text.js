`use strict`;

import React from "react";
import * as constants from "@/components/core/constants";
import { Select } from "antd";
import EDocTextStyleEditor from "@/components/eDoc/eDocTextStyleEditor";

export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.content = "여기에 텍스트를 설정하세요";
  defaultRuntimeData.textAlign = "left";
  defaultRuntimeData.positionAlign = "left";

  // font 관련 기본 설정
  defaultRuntimeData.fontFamily = "Arial";
  defaultRuntimeData.fontSize = 12;
  defaultRuntimeData.underline = false;
  defaultRuntimeData.fontColor = "#000000";
  defaultRuntimeData.backgroundColor = "#ffffff";
  defaultRuntimeData.fontWeight = "normal";

  return defaultRuntimeData;
};

export const getBindingValue = (component) => {
  if (!component.runtime_data?.bindingKey) {
    return null;
  }
  return component.runtime_data?.content || null;
};

export const getNewRuntimeData = (component, { key, value }) => {
  return {
    ...(component.runtime_data || {}),
    [key]: value,
  };
};

export function renderProperty(
  component,
  updateRuntimeData,
  renderWidthProperty,
  renderForceNewLineProperty,
  renderPositionAlignProperty
) {
  const renderComponentProperty = (component) => {
    return (
      <div>
        <label>Binding Key:</label>
        <input
          type="text"
          value={
            component.runtime_data?.bindingKey || constants.General.EmptyString
          }
          onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />

        <label>텍스트:</label>
        <textarea
          value={
            component.runtime_data?.content || constants.General.EmptyString
          }
          onChange={(e) => updateRuntimeData("content", e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded p-2"
        />

        <label>내용 정렬:</label>
        <Select
          value={component.runtime_data?.textAlign || "left"}
          onChange={(value) => updateRuntimeData("textAlign", value)}
          className="w-full h-12 border border-gray-300 rounded p-2 mb-2"
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
          underline={component.runtime_data?.underline || false}
          fontColor={component.runtime_data?.fontColor || "#000000"}
          backgroundColor={component.runtime_data?.backgroundColor || "#ffffff"}
          onChange={(updatedProps) => {
            Object.entries(updatedProps).forEach(([key, value]) => {
              updateRuntimeData(key, value);
            });
          }}
        />
      </div>
    );
  };

  return renderComponentProperty(component);
}

export default function RenderComponent(props) {
  const {
    documentData,
    pageData,
    component,
    handleComponentClick,
    onRuntimeDataChange,
    selectedClass,
    alignmentClass,
    textAlign,
    isDesignMode,
  } = props;

  const {
    // font 관련 속성들
    fontFamily,
    fontSize,
    fontWeight,
    underline,
    fontColor,
    backgroundColor,
  } = component.runtime_data || {};

  const style = {
    width: "100%",
    height: component.runtime_data?.height || "auto",
    textAlign, // 텍스트 정렬 적용
    fontFamily: fontFamily || "Arial",
    fontSize: fontSize ? `${fontSize}px` : "12px",
    fontWeight: fontWeight || "normal",
    textDecoration: underline ? "underline" : "none",
    color: fontColor || "#000000",
    backgroundColor: backgroundColor || "transparent",
  };

  return (
    <p
      className={`${selectedClass} ${alignmentClass} whitespace-pre-wrap overflow-visible cursor-pointer`}
      style={style}
      onClick={handleComponentClick}
    >
      {(component.runtime_data?.content || constants.General.EmptyString)
        .split("\n")
        .map((line, idx) => (
          <React.Fragment key={idx}>
            {line}
            <br />
          </React.Fragment>
        ))}
    </p>
  );
}
