`use strict`

import React from 'react';

export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.content = "여기에 텍스트를 입력하세요";
  defaultRuntimeData.textAlign = "left";
  defaultRuntimeData.positionAlign = "left";
  
  return defaultRuntimeData;
}

export const getNewRuntimeData = (component, newData) => {
    const currentData = component.runtime_data || {};
    let newRuntimeData = { ...currentData };

    newRuntimeData.content = newData;

    return newRuntimeData;
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
    <p
      className={`${selectedClass} ${alignmentClass} whitespace-pre-wrap overflow-visible cursor-pointer`}
      style={style}
      onClick={handleComponentClick}
    >
      {(component.runtime_data?.content || '').split('\n').map((line, idx) => (
        <React.Fragment key={idx}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </p>
  );
}