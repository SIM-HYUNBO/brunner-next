'use strict'

import { React, useState } from 'react';
import * as constants from '@/components/constants';
import { useModal } from "@/components/brunnerMessageBox";
import RequestServer from "@/components/requestServer";
import * as userInfo from "@/components/userInfo";

// ✅ 실제 버튼 렌더링
const RenderComponent = (props) => {
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
  const { BrunnerMessageBox, openModal } = useModal();
  const [loading, setLoading] = useState(false);

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

  const handleClick = async (comp) => {
    const runtimeData = comp.runtime_data;
  if (!runtimeData || 
      !runtimeData?.apiMethod || 
      !["GET", "POST"].includes(runtimeData?.apiMethod.toUpperCase())
    ) {
    openModal(constants.messages.MESSAGE_NOT_SUPPORTED_API_METHOD);
    return;
  }
  if (!runtimeData?.apiEndpoint) {
    openModal(constants.messages.MESSAGE_NOT_SET_API_ENDPOINT);
    return;
  }
  if (!runtimeData?.commandName) {
    openModal(`${constants.messages.MESSAGE_REQUIRED_FIELD} [commandName]`);
    return;
  }

  try {
    const jRequest = {
      commandName: `${constants.modulePrefix.edocCustom}.${runtimeData?.commandName}`, // ✅ 런타임에서 설정한 값
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
      bindingData: bindingData(documentData), // 문서내 바인딩 데이터 추출해서 전송
    };

    setLoading(true);
    const jResponse = await RequestServer(jRequest, apiMethod, apiEndpoint);
    setLoading(false);

    if (jResponse.error_code === 0) {
      await openModal(`${jResponse.error_message


      }].`);
      // 필요하다면 후속처리
    } else {
      await openModal(jResponse.error_message);
    }
  } catch (error) {
    await openModal(`message:${error.message}`);
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
            handleComponentClick(e);
          } else {
            handleClick(component);
          }
        }}
      >
        {buttonText || "버튼"}
      </button>
    </>
  );
};

// ✅ 기본 런타임 데이터 초기화 — commandName 추가
export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.buttonText = "버튼";
  defaultRuntimeData.apiEndpoint = "";
  defaultRuntimeData.apiMethod = "POST";
  defaultRuntimeData.commandName = ""
  defaultRuntimeData.buttonColor = "#4F46E5";
  defaultRuntimeData.textColor = "#FFFFFF";
  defaultRuntimeData.padding = "10px 20px";
  defaultRuntimeData.borderRadius = "6px";
  return defaultRuntimeData;
};

// ✅ 런타임 데이터 업데이트 유틸
export const getNewRuntimeData = (component, { key, value }) => {
  return {
    ...(component.runtime_data || {}),
    [key]: value
  };
};

// ✅ 속성 편집 UI — commandName 입력 추가
export function renderProperty(component, updateRuntimeData, renderWidthProperty, renderForceNewLineProperty, renderPositionAlignProperty) {
  const renderComponentProperty = (component) => {
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
          placeholder="http://localhost:3000/api/backendServer/" 
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

        <label>Command Name:</label> {/* ✅ 추가 */}
        <input
          type="text"
          placeholder={component.runtime_data?.commandName || ''}
          value={component.runtime_data?.commandName || ''}
          onChange={(e) => updateRuntimeData("commandName", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />

        {/* 폭, 줄바꿈, 위치정렬 속성 */}
        {renderWidthProperty()}
        {renderForceNewLineProperty()}
        {renderPositionAlignProperty()}

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
  };

  return renderComponentProperty(component);
}

export default RenderComponent;