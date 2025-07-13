`use strict`

import React from 'react';

export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.src = "";
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
      <label>이미지 URL:</label>
      <input
        type="text"
        value={component.runtime_data?.src || ''}
        onChange={(e) => updateRuntimeData("src", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />

      {renderWidthProperty()}
      {renderForceNewLineProperty()}
      {renderPositionAlignProperty()}
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
    <div
      className={`${selectedClass} ${alignmentClass} cursor-pointer`}
      onClick={handleComponentClick}
      style={{
        width:`100%`,
      }}
    >
      {component.runtime_data?.src ? (
        <img
          src={component.runtime_data.src}
          alt="이미지"
          className="inline-block h-auto"
          style={{
            width: '100%',
            maxWidth: '100%',
          }}
        />
      ) : (
        <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500">
          이미지 없음
        </div>
      )}
    </div>
  );
}