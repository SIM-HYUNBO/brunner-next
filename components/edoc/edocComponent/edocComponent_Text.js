`use strict`

import React from 'react';
import EDocTextStyleEditor from "@/components/edoc/EDocTextStyleEditor";

export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.content = "여기에 텍스트를 입력하세요";
  defaultRuntimeData.textAlign = "left";
  defaultRuntimeData.positionAlign = "left";

  // font 관련 기본 설정
  defaultRuntimeData.fontFamily = "Arial";
  defaultRuntimeData.fontSize = 12;
  defaultRuntimeData.underline = false;
  defaultRuntimeData.fontColor =  "#000000";
  defaultRuntimeData.backgroundColor = "#ffffff";
  defaultRuntimeData.fontWeight = "normal";

  return defaultRuntimeData;
}

export const getNewRuntimeData = (component, key, value) => {
  return { ...component.runtime_data, [key]: value };
}

export function renderProperty(component, updateRuntimeData, {
  renderWidthProperty, 
  renderForceNewLineProperty, 
  renderPositionAlignProperty}
) {
  const renderComponentProperty = (component) => {
      return (
        <div>
          <label>Binding Key:</label>
          <input
            type="text"
            value={component.runtime_data?.bindingKey || ''}
            onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />

          {renderWidthProperty()}
          {renderForceNewLineProperty()}
          {renderPositionAlignProperty()}

          <EDocTextStyleEditor
            fontFamily={component.runtime_data?.fontFamily || 'Arial'}
            fontSize={component.runtime_data?.fontSize || 12}
            fontWeight={component.runtime_data?.fontWeight || 'normal'}
            underline={component.runtime_data?.underline || false}
            fontColor={component.runtime_data?.fontColor || '#000000'}
            backgroundColor={component.runtime_data?.backgroundColor || '#ffffff'}
            onChange={(updatedProps) => {
              Object.entries(updatedProps).forEach(([key, value]) => {
                updateRuntimeData(key, value);
              });
            }}
          />

          <label>내용 정렬:</label>
          <select
            value={component.runtime_data?.textAlign || 'left'}
            onChange={(e) => updateRuntimeData("textAlign", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          >
            <option value="left">왼쪽</option>
            <option value="center">가운데</option>
            <option value="right">오른쪽</option>
          </select>

          <label>표시할 텍스트:</label>
          <textarea
            value={component.runtime_data?.content || ''}
            onChange={(e) => updateRuntimeData("content", e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
      );
  }

  return renderComponentProperty(component);
}

export const renderComponent = (
  component,
  handleComponentClick,
  onRuntimeDataChange,
  { selectedClass, alignmentClass, textAlign, isDesignMode }
) => {
  const {
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
      {(component.runtime_data?.content || "").split("\n").map((line, idx) => (
        <React.Fragment key={idx}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </p>
  );
};