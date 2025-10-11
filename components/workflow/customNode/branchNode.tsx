"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import * as constants from "@/components/core/constants";

interface BranchNodeData {
  design: any;
  run: any;
}

export default function BranchNode({ data }: NodeProps<BranchNodeData>) {
  const { mode, condition } = data.design;
  const width = 100; // 폭
  const height = width / 2; // 높이는 폭의 절반
  const portSize = 6; // 포트 크기

  const isLoopMode = mode === constants.workflowBranchNodeMode.Loop;
  const isBranchMode = mode === constants.workflowBranchNodeMode.Branch;

  return (
    <div style={{ width, height, position: "relative" }}>
      {/* 마름모 테두리 */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <polygon
          points={`${width / 2},0 ${width},${height / 2} ${
            width / 2
          },${height} 0,${height / 2}`}
          fill="#fff"
          stroke="#555"
          strokeWidth={1}
          strokeDasharray="4,4"
        />
      </svg>

      {/* 내용 */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
          fontSize: 12,
          fontWeight: "normal",
          padding: 4,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 8 }}>[{constants.workflowActions.BRANCH}]</div>
        {isLoopMode && <div style={{ fontSize: 8 }}>Loop</div>}
        {isBranchMode && <div style={{ fontSize: 8 }}>Branch</div>}
        {isBranchMode && (
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              background: "#fafafa",
              padding: "2px 4px",
              borderRadius: 3,
              marginTop: 2,
            }}
          >
            {condition || "—"}
          </div>
        )}

        {/* 🟢 입력 포트 2개 (상단 + 좌측) */}
        <Handle
          id="input_main"
          type="target"
          position={Position.Top}
          style={{
            top: -portSize / 2,
            left: "50%",
            width: portSize,
            height: portSize,
            borderRadius: "50%",
            background: "green",
            border: "2px solid #222",
            transform: "translateX(-50%)",
          }}
        />

        {isLoopMode && (
          <Handle
            id="input_loop"
            type="target"
            position={Position.Left}
            style={{
              left: -portSize / 2,
              top: "50%",
              width: portSize,
              height: portSize,
              borderRadius: "50%",
              background: "green",
              border: "2px solid #222",
              transform: "translateY(-50%)",
            }}
          />
        )}

        {/* 🔵 True 출력 (하단 중앙) */}
        <Handle
          id="true"
          type="source"
          position={Position.Bottom}
          style={{
            bottom: -portSize / 2,
            left: "50%",
            width: portSize,
            height: portSize,
            borderRadius: "50%",
            background: "blue",
            border: "2px solid #222",
            transform: "translateX(-50%)",
          }}
        />

        {/* 🔴 False 출력 (우측 중앙) */}
        <Handle
          id="false"
          type="source"
          position={Position.Right}
          style={{
            right: -portSize / 2,
            top: "50%",
            width: portSize,
            height: portSize,
            borderRadius: "50%",
            background: "red",
            border: "2px solid #222",
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </div>
  );
}
