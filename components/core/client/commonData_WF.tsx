"use client";

import * as constants from "@/components/core/constants";
import * as commonData from "@/components/core/commonData";

import { Handle, Position } from "reactflow";
import type {
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  NodeProps,
} from "reactflow";

// 컬럼 단위 정의

// -------------------- 타입 정의 --------------------

export interface ActionNodeData {
  label: string;
  actionName: string;
  status: string;
  design: {
    inputs: commonData.DataTable[];
    outputs: commonData.DataTable[];

    // Script Node
    scriptContents?: string;
    scriptTimeoutMs?: number;

    // Branch Node
    mode?: string;
    condition?: string;
    loopStartValue?: any;
    loopStepValue?: any;
    loopLimitValue?: any;

    // Sql Node

    sqlStmt?: string;
    sqlParams?: any[];
    dbConnectionId?: string;
    outputTableName?: string;

    // Call Node
    targetWorkflowId?: string;
    targetWorkflowName?: string;
  };
  run: {
    inputs: commonData.DataTable[];
    outputs: commonData.DataTable[];
  };
}

export interface ConditionEdgeData {
  condition?: string;
}

export type DesignColumn = {
  name: string;
  type: "string" | "number" | "boolean" | "object";
};

export type DesignedDataset = Record<string, DesignColumn[]>;
type InputDataset = Record<string, Record<string, any>[]>;

const WorkflowDefaultNode: React.FC<NodeProps<ActionNodeData>> = ({ data }) => {
  const isStart = data.actionName === constants.workflowActions.START;
  const isEnd = data.actionName === constants.workflowActions.END;
  const hasPorts = [
    constants.workflowActions.SCRIPT,
    constants.workflowActions.SQL,
    constants.workflowActions.CALL,
  ].includes(data.actionName);

  return (
    <div
      style={{
        padding: 6,
        border: "1px dashed #222",
        textAlign: "center",
        fontSize: 8,
      }}
    >
      [{data.actionName}] {data.label}
      {/* Start: 하단 source */}
      {isStart && <Handle type="source" position={Position.Bottom} />}
      {/* End: 상단 target */}
      {isEnd && <Handle type="target" position={Position.Top} />}
      {/* 일반 노드: 상단 target / 하단 source */}
      {hasPorts && !isStart && !isEnd && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            style={{ background: "green" }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            style={{ background: "blue" }}
          />
        </>
      )}
    </div>
  );
};

interface BranchNodeData {
  label: string;
  actionName: string;
  status: string;
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
        <div style={{ fontSize: 8 }}>
          [{constants.workflowActions.BRANCH}-
          {isLoopMode && constants.workflowBranchNodeMode.Loop}
          {isBranchMode && constants.workflowBranchNodeMode.Branch}]
        </div>
        <div style={{ fontSize: 8 }}>{data.label}</div>

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

// 노드 유형별 렌더링 컴포넌트 등록 (일반노드와 Custom노드 유형 구분)
export const nodeTypes = {
  default: WorkflowDefaultNode,
  branch: BranchNode,
};
