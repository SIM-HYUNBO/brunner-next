"use strict";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import BrunnerVideo from "@/components/core/client/brunnerVideo";
import * as constants from "@/components/core/constants";

/**
 * 기본 runtime_data 초기화
 */
export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.url = constants.General.EmptyString;
  defaultRuntimeData.title = "영상 제목";
  defaultRuntimeData.originalWidth = 640;
  defaultRuntimeData.originalHeight = 360;
  return defaultRuntimeData;
};

/**
 * 바인딩 값 가져오기 (URL 바인딩 등)
 */
export const getBindingValue = (component) => {
  if (!component.runtime_data?.bindingKey) {
    return null;
  }
  return component.runtime_data?.url || null;
};

/**
 * runtime_data 갱신하기
 */
export const getNewRuntimeData = (component, { key, value }) => {
  return {
    ...(component.runtime_data || {}),
    [key]: value,
  };
};

/**
 * 속성 편집기
 */
export function renderProperty(
  component,
  updateRuntimeData,
  renderWidthProperty,
  renderForceNewLineProperty,
  renderPositionAlignProperty
) {
  const renderComponentProperty = () => {
    return (
      <div>
        <label>Binding Key:</label>
        <input
          type="text"
          value={
            component.runtime_data?.bindingKey || constants.General.EmptyString
          }
          onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />

        <label>영상 제목:</label>
        <input
          type="text"
          value={component.runtime_data?.title || constants.General.EmptyString}
          onChange={(e) => updateRuntimeData("title", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />

        <label>영상 URL:</label>
        <input
          type="text"
          value={component.runtime_data?.url || constants.General.EmptyString}
          onChange={(e) => updateRuntimeData("url", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />

        <label>원본 가로 크기(px):</label>
        <input
          type="number"
          value={component.runtime_data?.originalWidth || 640}
          onChange={(e) =>
            updateRuntimeData("originalWidth", parseInt(e.target.value, 10))
          }
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />

        <label>원본 세로 크기(px):</label>
        <input
          type="number"
          value={component.runtime_data?.originalHeight || 360}
          onChange={(e) =>
            updateRuntimeData("originalHeight", parseInt(e.target.value, 10))
          }
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />

        {renderWidthProperty && renderWidthProperty()}
        {renderForceNewLineProperty && renderForceNewLineProperty()}
        {renderPositionAlignProperty && renderPositionAlignProperty()}
      </div>
    );
  };

  return renderComponentProperty(component);
}

/**
 * 런타임/디자인 렌더링
 */
export default function RenderComponent(props) {
  const {
    documentData,
    pageData,
    component,
    handleComponentClick,
    onRuntimeDataChange,
    selectedClass,
    alignmentClass,
    textAlign,
    isDesignMode,
  } = props;

  const {
    title = "영상 제목",
    url = constants.General.EmptyString,
    originalWidth = 640,
    originalHeight = 360,
  } = component.runtime_data || {};

  const [size, setSize] = useState({
    width: originalWidth,
    height: originalHeight,
  });

  const containerRef = useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newWidth = Math.min(containerWidth, originalWidth);
        const aspectRatio = originalWidth / originalHeight;
        const newHeight = Math.round(newWidth / aspectRatio);

        setSize({
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [originalWidth, originalHeight]);

  return (
    <div
      ref={containerRef}
      className={`${selectedClass} ${alignmentClass} cursor-pointer`}
      onClick={(e) => {
        e.stopPropagation();
        handleComponentClick?.(component);
      }}
    >
      <BrunnerVideo
        url={url}
        title={title}
        width="800px" // 100%
        height="450px" // 100%
        className={`mt-5`}
      ></BrunnerVideo>
    </div>
  );
}
