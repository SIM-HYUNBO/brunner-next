"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import * as constants from "@/components/core/constants";

export default function BranchNode({ data }: any) {
  const { mode, condition, startIndex, limit, step, currentIndex } = data;

  const isLoopMode = mode === constants.workflowBranchNodeMode.Loop;
  const isConditionMode = mode === constants.workflowBranchNodeMode.Branch;

  return (
    <div
      style={{
        padding: 10,
        background: "#fff",
        border: "2px solid #555",
        borderRadius: 6,
        minWidth: 180,
        textAlign: "center",
      }}
    >
      {/* 입력 */}
      <Handle type="target" position={Position.Left} />

      <div style={{ fontWeight: "bold", marginBottom: 6 }}>Branch Node</div>

      {/* 모드 상태 */}
      <div>
        Mode:{" "}
        <b
          style={{
            color: isLoopMode ? "#1d7" : isConditionMode ? "#17d" : "red",
          }}
        >
          {mode || "—"}
        </b>
      </div>

      {/* 루프 모드 */}
      {isLoopMode && (
        <div style={{ marginTop: 8, fontSize: 12, textAlign: "left" }}>
          <div>초기값: {startIndex ?? 0}</div>
          <div>
            리미트:{" "}
            <span
              style={{
                color: limit?.toString()?.startsWith("${") ? "#c70" : "#000",
              }}
            >
              {limit ?? "—"}
            </span>
          </div>
          <div>증분값: {step ?? 1}</div>
          <div>현재 인덱스: {currentIndex ?? startIndex ?? 0}</div>
        </div>
      )}

      {/* 분기 모드 */}
      {isConditionMode && (
        <div style={{ marginTop: 8, fontSize: 12 }}>
          <div>조건식:</div>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 4,
              padding: "4px 6px",
              background: "#fafafa",
              fontFamily: "monospace",
            }}
          >
            {condition || "—"}
          </div>
        </div>
      )}

      {/* 모드 미선택 시 경고 */}
      {!isLoopMode && !isConditionMode && (
        <div style={{ color: "red", marginTop: 6, fontSize: 12 }}>
          ⚠️ 모드를 선택하세요
        </div>
      )}

      {/* 출력 (true/false 포트) */}
      <Handle
        type="source"
        id="true"
        position={Position.Right}
        style={{ top: "35%" }}
      />
      <Handle
        type="source"
        id="false"
        position={Position.Bottom}
        style={{ top: "75%" }}
      />
    </div>
  );
}
