'use strict'

import { React, useState } from 'react';
import * as constants from '@/components/constants';
import { useModal } from "@/components/brunnerMessageBox";
import RequestServer from "@/components/requestServer";
import * as userInfo from "@/components/userInfo";

// ✅ 기본 런타임 데이터 초기화 — commandName 추가
export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.buttonText = "버튼";
  defaultRuntimeData.apiEndpoint = "/api/backendServer/";
  defaultRuntimeData.apiMethod = "POST";
  defaultRuntimeData.commandName = "eDoc.{CommandName}"; // ✅ commandName 기본값
  defaultRuntimeData.buttonColor = "#4F46E5";
  defaultRuntimeData.textColor = "#FFFFFF";
  defaultRuntimeData.padding = "10px 20px";
  defaultRuntimeData.borderRadius = "6px";
  return defaultRuntimeData;
};

// ✅ 런타임 데이터 업데이트 유틸
export const getNewRuntimeData = (component, key, value) => {
  return { ...component.runtime_data, [key]: value };
};

// ✅ 속성 편집 UI — commandName 입력 추가
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

      <label>Command Name:</label> {/* ✅ 추가 */}
      <input
        type="text"
        value={component.runtime_data?.commandName || ''}
        onChange={(e) => updateRuntimeData("commandName", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />

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
    commandName, // ✅
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
    if (apiMethod && !["GET", "POST"].includes(apiMethod.toUpperCase())) {
      openModal(constants.messages.MESSAGE_NOT_SUPPORTED_API_METHOD);
      return;
    }
    if (!apiEndpoint) {
      openModal(constants.messages.MESSAGE_NOT_SET_API_ENDPOINT);
      return;
    }
    if (!commandName) {
      openModal("commandName을 설정해주세요."); // ✅
      return;
    }

    try {
      const jRequest = {
        commandName: `edocCustom.${commandName}`, // ✅ 런타임에서 설정한 값
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
        runtimeData: component.runtime_data, // 버튼의 런타임 데이터를 전달하면 안됨
      };

      setLoading(true);
      const jResponse = await RequestServer(apiMethod || "POST", jRequest, apiEndpoint);
      setLoading(false);

      if (jResponse.error_code === 0) {
        openModal(constants.messages.MESSAGE_SUCCESS_FINISHED);
        // 필요하다면 후속처리
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
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
            handleClick();
          }
        }}
      >
        {buttonText || "버튼"}
      </button>
    </>
  );
};
