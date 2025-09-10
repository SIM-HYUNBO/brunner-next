"use strict";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.jsonString = "";
  defaultRuntimeData.positionAlign = "center";
  defaultRuntimeData.loop = true;
  defaultRuntimeData.autoplay = true;
  defaultRuntimeData.width = 200;
  defaultRuntimeData.height = 200;
  return defaultRuntimeData;
};

export const getBindingValue = (component) => {
  return component.runtime_data?.jsonString || null;
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
  return (
    <div>
      <label className="block mb-1">Binding Key:</label>
      <input
        type="text"
        value={component.runtime_data?.bindingKey || ""}
        onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />

      <label className="block mb-1">Lottie JSON:</label>
      <textarea
        value={component.runtime_data?.jsonString || ""}
        onChange={(e) => updateRuntimeData("jsonString", e.target.value)}
        placeholder="여기에 JSON 문자열을 입력하세요"
        className="w-full border border-gray-300 rounded p-2 mb-4 h-32"
      />

      {renderWidthProperty()}
      {renderForceNewLineProperty()}
      {renderPositionAlignProperty()}
    </div>
  );
}

export default function RenderComponent({
  component,
  handleComponentClick,
  selectedClass,
  alignmentClass,
}) {
  const animationData = useMemo(() => {
    try {
      return JSON.parse(component.runtime_data?.jsonString || null);
    } catch (e) {
      console.error("Invalid Lottie JSON:", e);
      return null;
    }
  }, [component.runtime_data?.jsonString]);

  const style = {
    width: component.runtime_data?.width || 200,
    height: component.runtime_data?.height || 200,
    textAlign: component.runtime_data?.positionAlign,
  };

  return (
    <div
      className={`${selectedClass} ${alignmentClass} cursor-pointer inline-block`}
      onClick={handleComponentClick}
      style={{ width: "100%" }}
    >
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop={component.runtime_data?.loop}
          autoplay={component.runtime_data?.autoplay}
          style={style}
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
          Lottie 애니메이션 없음 또는 JSON 오류
        </div>
      )}
    </div>
  );
}