`use strict`

import React from 'react';
import EDocTextStyleEditor from "@/components/edoc/EDocTextStyleEditor";

export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.placeholder = "값을 입력하세요";
  defaultRuntimeData.textAlign = "left";
  defaultRuntimeData.positionAlign = "left";
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

        <label>텍스트:</label>
        <input
          type="text"
          value={component.runtime_data?.value || ''}
          onChange={(e) => updateRuntimeData("value", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
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
      </div>
    );
  }

  return renderComponentProperty(component);
}

export const renderComponent = (component, handleComponentClick, onRuntimeDataChange, {
  selectedClass, 
  alignmentClass, 
  textAlign}) => {
  const style = {
    width: '100%',
    height: component.runtime_data?.height || 'auto',
    textAlign, // 텍스트 정렬 적용
  };

  return (
    <input
      type="text"
      className={`${selectedClass} ${alignmentClass} h-8 cursor-pointer`}
      style={{ ...style }}
      value={component.runtime_data?.value || ''}
      placeholder={component.runtime_data?.placeholder || ''}
      onClick={handleComponentClick}
      onChange={(e) => onRuntimeDataChange(e.target.value)}
    />
  );
}
