"use strict";

import React from "react";
import EDocTextStyleEditor from "@/components/eDoc/eDocTextStyleEditor";

export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.placeholder = "여기에 값을 입력하세요";
  defaultRuntimeData.textAlign = "left";
  defaultRuntimeData.positionAlign = "left";

  // font 관련 기본 설정
  defaultRuntimeData.fontFamily = "Arial";
  defaultRuntimeData.fontSize = 12;
  defaultRuntimeData.underline = false;
  defaultRuntimeData.fontColor = "#000000";
  defaultRuntimeData.backgroundColor = "#ffffff";
  defaultRuntimeData.fontWeight = "normal";

  // 입력 가능 여부 (기본값: true)
  defaultRuntimeData.editable = true;

  return defaultRuntimeData;
};

export const getBindingValue = (component) => {
  if (!component.runtime_data?.bindingKey) {
    return null;
  }
  return component.runtime_data?.value || null;
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
          value={component.runtime_data?.bindingKey || ""}
          onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />

        <label>입력값:</label>
        <input
          type="text"
          value={component.runtime_data?.value || ""}
          onChange={(e) => updateRuntimeData("value", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />

        <label>내용 정렬:</label>
        <select
          value={component.runtime_data?.textAlign || "left"}
          onChange={(e) => updateRuntimeData("textAlign", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        >
          <option value="left">왼쪽</option>
          <option value="center">가운데</option>
          <option value="right">오른쪽</option>
        </select>

        {/* 입력 가능 여부 */}
        <label className="inline-flex items-center mb-2">
          <input
            type="checkbox"
            checked={component.runtime_data?.editable ?? true}
            onChange={(e) => updateRuntimeData("editable", e.target.checked)}
            className="mr-2"
          />
          입력 가능 (Editable)
        </label>

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

  const isEditable = component.runtime_data?.editable ?? true;

  const style = {
    width: "100%",
    height: component.runtime_data?.height || "auto",
    textAlign,
    fontFamily: component.runtime_data?.fontFamily || "Arial",
    fontSize: component.runtime_data?.fontSize
      ? `${component.runtime_data.fontSize}px`
      : "14px",
    fontWeight: component.runtime_data?.fontWeight || "normal",
    color: component.runtime_data?.fontColor || "#000000",
    backgroundColor: component.runtime_data?.backgroundColor || "transparent",
    cursor: isEditable ? "text" : "default",
  };

  return (
    <input
      type="text"
      className={`${selectedClass} ${alignmentClass} h-8 ${
        isEditable ? "cursor-text" : "cursor-default"
      } ${!isEditable ? "bg-gray-100" : ""}`}
      style={style}
      value={component.runtime_data?.value || ""}
      placeholder={component.runtime_data?.placeholder || ""}
      readOnly={!isEditable}
      onClick={handleComponentClick}
      onChange={(e) => {
        if (isEditable) {
          onRuntimeDataChange({
            runtime_data: {
              ...component.runtime_data,
              value: e.target.value,
            },
          });
        }
      }}
    />
  );
}
