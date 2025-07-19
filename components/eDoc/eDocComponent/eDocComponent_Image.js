`use strict`

import React from 'react';

export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.src = "";
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

export const getBindingValue = (component) => {
  if (!component.runtime_data?.bindingKey) {
    return null;
  }
  // 이미지 컴포넌트는 src 속성을 사용하므로, bindingKey와
  // runtime_data.src를 통해 이미지 URL을 가져옵니다.
  return component.runtime_data?.src || null;
}

export const getNewRuntimeData = (component, { key, value }) => {
  return {
    ...(component.runtime_data || {}),
    [key]: value
  };
};

export function renderProperty(component,  updateRuntimeData, renderWidthProperty, renderForceNewLineProperty, renderPositionAlignProperty) {

    const renderComponentProperty = (component) => {
      const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
          updateRuntimeData("src", reader.result); // Base64 저장!
        };
        reader.readAsDataURL(file);
      };

      return (
        <div>
          <label className="block mb-1">Binding Key:</label>
          <input
            type="text"
            value={component.runtime_data?.bindingKey || ''}
            onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />

          <label className="block mb-1">이미지 URL:</label>
          <input
            type="text"
            value={component.runtime_data?.src || ''}
            readOnly // 👉 직접 입력 불가!
            placeholder="파일을 선택하면 자동으로 채워집니다"
            className="w-full border border-gray-300 rounded p-2 mb-2 bg-gray-100 cursor-not-allowed"
          />

          <label className="block mb-1">로컬 이미지 선택:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full mb-4"
          />

          {renderWidthProperty()}
          {renderForceNewLineProperty()}
          {renderPositionAlignProperty()}
        </div>
      );
    };
  return renderComponentProperty(component);
}

export default function RenderComponent (props) {
  const {
    component,
    handleComponentClick,
    onRuntimeDataChange,
    selectedClass, 
    alignmentClass, 
    textAlign, 
    isDesignMode, 
    bindingData, 
    documentData 
  } = props;
  
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