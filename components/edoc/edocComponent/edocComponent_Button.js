'use strict'


import { React, useState } from 'react';
import * as constants from '@/components/constants';
import { useModal } from "@/components/brunnerMessageBox";

// ✅ 기본 런타임 데이터 초기화
export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.buttonText = "버튼";
  defaultRuntimeData.apiEndpoint = "/api/submit";
  defaultRuntimeData.apiMethod = "POST";
  defaultRuntimeData.buttonColor = "#4F46E5"; // 기본 파란색
  defaultRuntimeData.textColor = "#FFFFFF";   // 흰색 글씨
  defaultRuntimeData.padding = "10px 20px";
  defaultRuntimeData.borderRadius = "6px";
  return defaultRuntimeData;
};


// ✅ 런타임 데이터 업데이트 유틸
export const getNewRuntimeData = (component, key, value) => {
  return { ...component.runtime_data, [key]: value };
};

// ✅ 속성 편집 UI 렌더링
export function renderProperty(component, updateRuntimeData) {
  return (
    <div>
      <label>버튼 텍스트:</label>
      <input
        type="text"
        value={component.runtime_data?.buttonText || ''}
        onChange={(e) => updateRuntimeData("buttonText", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />

      <label>API Endpoint:</label>
      <input
        type="text"
        value={component.runtime_data?.apiEndpoint || ''}
        onChange={(e) => updateRuntimeData("apiEndpoint", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />

      <label>API Method:</label>
      <select
        value={component.runtime_data?.apiMethod || 'POST'}
        onChange={(e) => updateRuntimeData("apiMethod", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      >
        <option value="POST">POST</option>
        <option value="GET">GET</option>
      </select>

      <label>버튼 색상:</label>
      <input
        type="color"
        value={component.runtime_data?.buttonColor || '#4F46E5'}
        onChange={(e) => updateRuntimeData("buttonColor", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />

      <label>글자 색상:</label>
      <input
        type="color"
        value={component.runtime_data?.textColor || '#FFFFFF'}
        onChange={(e) => updateRuntimeData("textColor", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />

      <label>Padding:</label>
      <input
        type="text"
        value={component.runtime_data?.padding || '10px 20px'}
        onChange={(e) => updateRuntimeData("padding", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />

      <label>Border Radius:</label>
      <input
        type="text"
        value={component.runtime_data?.borderRadius || '6px'}
        onChange={(e) => updateRuntimeData("borderRadius", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />
    </div>
  );
}

// ✅ 실제 버튼 렌더링
export const renderComponent = (
  component,
  handleComponentClick,
  onRuntimeDataChange,
  { selectedClass, alignmentClass, textAlign, isDesignMode }
) => {
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();
  
  const {
    buttonText,
    apiEndpoint,
    apiMethod,
    buttonColor,
    textColor,
    padding,
    borderRadius,
  } = component.runtime_data || {};

  const style = {
    backgroundColor: buttonColor || "#4F46E5",
    color: textColor || "#FFFFFF",
    padding: padding || "10px 20px",
    border: "none",
    borderRadius: borderRadius || "6px",
    cursor: "pointer",
  };

  const handleClick = async () => {
    if(apiMethod && !["GET", "POST"].includes(apiMethod.toUpperCase())) {
      openModal (constants.messages.MESSAGE_NOT_SUPPORTED_API_METHOD);
      return;
    }
    if(!apiEndpoint) {
      openModal(constants.messages.MESSAGE_NOT_SET_API_ENDPOINT);
      return;
    }   

    try {
      const response = await fetch(apiEndpoint, {
        method: apiMethod || "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        // 예시 payload: 현재 컴포넌트의 데이터 전송
        body: JSON.stringify({ data: component.runtime_data }),
      });

      if (!response.ok) {
        throw new Error(`${constants.messages.MESSAGE_FAILED_REQUESTED}: ${response.status}`);
      }

      const result = await response.json();
      console.log(constants.messages.MESSAGE_SUCCESS_REQUESTED, result);
      openModal(constants.messages.MESSAGE_SUCCESS_REQUESTED);
    } catch (error) {
      console.error(error);
      openModal(`${error.message}`);
    }
  };

  return (
    <>
    <BrunnerMessageBox />
    <button
      className={`${selectedClass} ${alignmentClass}`}
      style={style}
      onClick={(e) => {
        e.stopPropagation();

        if (isDesignMode) {
          handleComponentClick(e);  // 디자인 모드에만 선택 처리
        } else {
          handleClick(); 
        }
      }}
    >
      {buttonText || "버튼"}
    </button>
    </>
  );
};
