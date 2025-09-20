"use strict";

import { React, useState } from "react";
import * as constants from "@/components/core/constants";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import RequestServer from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import * as commonFunctions from "@/components/core/commonFunctions";
import { runWorkflow } from "@/components/workflow/workflowEngine";
import { message } from "hawk/lib/client";

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
    pageData,
    documentData,
  } = props;
  const { BrunnerMessageBox, openModal } = useModal();
  const [loading, setLoading] = useState(false);

  const { buttonText, buttonColor, textColor, padding, borderRadius } =
    component.runtime_data || {};

  const style = {
    backgroundColor: buttonColor || "#4F46E5",
    color: textColor || "#FFFFFF",
    padding: padding || "10px 20px",
    border: "none",
    borderRadius: borderRadius || "6px",
    cursor: "pointer",
  };

  const handleClick = async (comp) => {
    // 버튼 클릭은 워크플로우의 액션 실행하는 걸로 변경
    const { workflow } = comp.runtime_data || {};
    if (!workflow) return;

    try {
      const wf = JSON.parse(workflow);
      await runWorkflow(wf, { contextData: documentData });
    } catch (err) {
      openModal(
        `${constants.messages.FAILED_TO_EXECUTE_WORKFLOW}\n ${err.message}`
      );
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
  defaultRuntimeData.actionName = "";
  defaultRuntimeData.buttonColor = "#4F46E5";
  defaultRuntimeData.textColor = "#FFFFFF";
  defaultRuntimeData.padding = "10px 20px";
  defaultRuntimeData.borderRadius = "6px";
  return defaultRuntimeData;
};

export const getBindingValue = (component) => {
  if (!component.runtime_data?.bindingKey) {
    return null;
  }
  // 버튼 컴포넌트는 text 을 가져옵니다.
  return component.runtime_data?.buttonText || null;
};

// ✅ 런타임 데이터 업데이트 유틸
export const getNewRuntimeData = (component, { key, value }) => {
  return {
    ...(component.runtime_data || {}),
    [key]: value,
  };
};

// ✅ 속성 편집 UI — commandName 입력 추가
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
        <label>버튼 텍스트:</label>
        <input
          type="text"
          value={component.runtime_data?.buttonText || ""}
          onChange={(e) => updateRuntimeData("buttonText", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />
        <label>Workflow Description:</label> {/* ✅ 추가 */}
        <textarea
          value={component.runtime_data?.workflow}
          onChange={(e) => updateRuntimeData("workflow", e.target.value)}
          className="w-full flex-grow border p-2 rounded mb-4 resize-none"
          placeholder={`{ "steps": [
              { "actionName": "callApi", "params": { "url": "api/save", "method": ${constants.httpMethod.POST}, "body": { "data": "{{input.data}}" } } },
              { "actionName": "showToast", "params": { "message": "work complete." } },
              { "actionName": "navigate", "params":{ "target": "/dashboard" }}]}`}
        />
        {/* 폭, 줄바꿈, 위치정렬 속성 */}
        {renderWidthProperty()}
        {renderForceNewLineProperty()}
        {renderPositionAlignProperty()}
        <div className="mb-2">
          <label className="block mb-1">버튼 색상</label>
          <input
            type="color"
            value={
              component.runtime_data?.buttonColor === "transparent"
                ? "#ffffff" // 체크 시 색상은 표시용 기본값
                : component.runtime_data?.buttonColor || "#4F46E5"
            }
            onChange={(e) => updateRuntimeData("buttonColor", e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
            disabled={component.runtime_data?.buttonColor === "transparent"} // 투명 선택 시 색상 선택 비활성
          />

          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={component.runtime_data?.buttonColor === "transparent"}
              onChange={(e) =>
                updateRuntimeData(
                  "buttonColor",
                  e.target.checked ? "transparent" : "#4F46E5" // 체크 시 투명, 해제 시 기본색
                )
              }
              className="mr-2"
            />
            Transparent
          </label>
        </div>
        <label>글자 색상:</label>
        <input
          type="color"
          value={component.runtime_data?.textColor || "#FFFFFF"}
          onChange={(e) => updateRuntimeData("textColor", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />
        <label>Padding:</label>
        <input
          type="text"
          value={component.runtime_data?.padding || "10px 20px"}
          onChange={(e) => updateRuntimeData("padding", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />
        <label>Border Radius:</label>
        <input
          type="text"
          value={component.runtime_data?.borderRadius || "6px"}
          onChange={(e) => updateRuntimeData("borderRadius", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />
      </div>
    );
  };

  return renderComponentProperty(component);
}

export default RenderComponent;
