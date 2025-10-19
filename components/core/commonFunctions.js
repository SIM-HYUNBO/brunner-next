`use strict`;

import { useState, useRef, useEffect } from "react";
import * as constants from "@/components/core/constants";
import * as InputComponent from "@/components/eDoc/eDocComponent/eDocComponent_Input";
import * as TextComponent from "@/components/eDoc/eDocComponent/eDocComponent_Text";
import * as ImageComponent from "@/components/eDoc/eDocComponent/eDocComponent_Image";
import * as TableComponent from "@/components/eDoc/eDocComponent/eDocComponent_Table";
import * as CheckListComponent from "@/components/eDoc/eDocComponent/eDocComponent_CheckList";
import * as ButtonComponent from "@/components/eDoc/eDocComponent/eDocComponent_Button";
import * as VideoComponent from "@/components/eDoc/eDocComponent/eDocComponent_Video";
import * as LottieComponent from "@/components/eDoc/eDocComponent/eDocComponent_Lottie";

import RequestServer from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";

export function isJsonObject(obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj);
}

export function generateUUID() {
  // Public Domain/MIT
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Bind data from documentData to a simpler object
export const getDocumentBindingData = (documentData) => {
  if (!Array.isArray(documentData.pages)) return {};

  return documentData.pages.reduce((acc, pageData) => {
    if (!Array.isArray(pageData.components)) return acc;

    pageData.components.forEach((comp) => {
      let value = null;
      let bindingKey = comp.runtime_data.bindingKey;
      if (bindingKey) {
        switch (comp.type) {
          case constants.edocComponentType._TEXT:
            value = TextComponent.getBindingValue(comp);
            break;
          case constants.edocComponentType._INPUT:
            value = InputComponent.getBindingValue(comp);
            break;
          case constants.edocComponentType._IMAGE:
            value = ImageComponent.getBindingValue(comp);
            break;
          case constants.edocComponentType._TABLE:
            value = TableComponent.getBindingValue(comp);
            break;
          case constants.edocComponentType._CHECKLIST:
            value = CheckListComponent.getBindingValue(comp);
            break;
          case constants.edocComponentType._BUTTON:
            value = ButtonComponent.getBindingValue(comp);
            break;
          case constants.edocComponentType._VIDEO:
            value = VideoComponent.getBindingValue(comp);
            break;
          case constants.edocComponentType._LOTTIE:
            value = LottieComponent.getBindingValue(comp);
            break;
          default:
            break;
        }
        acc[bindingKey] = value;
      }
    });
    return acc;
  }, {});
};

export function useDeviceType() {
  const [device, setDeviceType] = useState({
    isMobile: false,
    isTablet: false,
  });

  useEffect(() => {
    if (!window) return;

    function updateDeviceType() {
      const width = window.innerWidth;
      setDeviceType({
        isMobile: width < 767,
        isTablet: width >= 767 && width < 1024,
      });
    }

    updateDeviceType();

    window.addEventListener("resize", updateDeviceType);
    return () => window.removeEventListener("resize", updateDeviceType);
  }, []);

  return device;
}

export async function getDocumentData(userId, documentId) {
  try {
    const jRequest = {
      commandName: constants.commands.EDOC_DOCUMENT_SELECT_ONE,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userId,
      documentId: documentId,
    };

    const jResponse = await RequestServer(jRequest);

    if (jResponse.error_code === 0) {
      const doc = jResponse.documentData || {};
      return doc;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  } finally {
  }
}

export const getAdminDocumentList = async () => {
  const jRequest = {
    commandName: constants.commands.EDOC_ADMIN_DOCUMENT_SELECT_ALL,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userInfo.getLoginUserId(),
  };

  const jResponse = await RequestServer(jRequest);
  if (jResponse.error_code === 0 && Array.isArray(jResponse.documentList)) {
    // const sectionLabel = "Admin's pages";
    // items.push({ label: sectionLabel, type: "section" });

    return jResponse.documentList;
  }

  return null;
};

export const getUsersDocumentList = async () => {
  const userId = userInfo.getLoginUserId();
  if (!userId) return null;

  const jRequest = {
    commandName: constants.commands.EDOC_USER_DOCUMENT_SELECT_ALL,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userId,
  };

  const jResponse = await RequestServer(jRequest);
  if (jResponse.error_code === 0 && Array.isArray(jResponse.documentList)) {
    return jResponse.documentList;
  }

  return null;
};

// -------------------- 기본 입력/출력 --------------------
export function getDefaultInputs(actionName) {
  switch (actionName) {
    case constants.workflowActions.START:
      return [{ table: "INDATA", columns: [], rows: [] }];
    case constants.workflowActions.CALL:
    case constants.workflowActions.END:
      return [{ table: "INDATA", columns: [], rows: [] }];
    case constants.workflowActions.SCRIPT:
      return [{ table: "INDATA", columns: [], rows: [] }];
    case constants.workflowActions.SQL:
      return [{ table: "INDATA", columns: [], rows: [] }];
    case constants.workflowActions.BRANCH:
      return [];
    case constants.workflowActions.CALL:
      return [{ table: "INDATA", columns: [], rows: [] }];
    default:
      throw new Error(constants.messages.WORKFLOW_NOT_SUPPORTED_NODE_TYPE);
  }
}

export function getDefaultOutputs(actionName) {
  switch (actionName) {
    case constants.workflowActions.START:
    case constants.workflowActions.END:
    case constants.workflowActions.SCRIPT:
    case constants.workflowActions.SQL:
    case constants.workflowActions.BRANCH:
    case constants.workflowActions.CALL:
      return [{ table: "OUTDATA", columns: [], rows: [] }];
    default:
      throw new Error(constants.messages.WORKFLOW_NOT_SUPPORTED_NODE_TYPE);
  }
}

export function getJsonDefaultTypedValue(value) {
  const type = value?.type ?? typeof value;
  switch (type) {
    case "string":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    default:
      return Array.isArray(value) ? [] : {};
  }
}

// Json 노드 값 탐색

// 노드 라벨로 접근
// console.log(getByPath(workflow, "nodes.MyNode.data.design.outputs.0.table");

// 노드 ID(uuid 값)로 접근
// getByPath(workflow, "nodes.abc123.data.design.outputs.0.table");

export function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  const keys = path.split(".").filter(Boolean);

  let target = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (target == null) return undefined;

    const index = Number(key);
    const realKey = !isNaN(index) ? index : key;

    // 🔹 nodes.<라벨 or id> 접근 처리
    if (keys[0] === "nodes" && i === 1) {
      if (Array.isArray(target.nodes)) {
        target =
          target.nodes.find(
            (n) => n.id === realKey || n.data?.label === realKey
          ) || undefined;
        continue;
      }
    }

    target = target[realKey];
  }

  return target;
}

// Json 노드 값 변경
// setByPath(workflow, "nodes.MyNode.data.design.outputs.0.table", "NEW_TABLE");
// getByPath(workflow, "nodes.abc123.data.design.outputs.0.table")

// 일반 데이터 접근
// getByPath(workflow, "data.run.inputs.INPUT_TABLE.0.service"));

export function setByPath(obj, path, value) {
  if (!obj || !path) return;
  const keys = path.split(".").filter(Boolean);

  let target = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const index = Number(key);
    const realKey = !isNaN(index) ? index : key;

    // 🔹 nodes.<라벨 or id> 처리
    if (keys[0] === "nodes" && i === 1) {
      if (Array.isArray(target.nodes)) {
        let node = target.nodes.find(
          (n) => n.id === realKey || n.data?.label === realKey
        );
        if (!node) {
          node = { id: realKey, data: {} };
          target.nodes.push(node);
        }
        target = node;
        continue;
      }
    }

    if (target[realKey] == null) {
      const nextKey = keys[i + 1];
      const nextIndex = Number(nextKey);
      target[realKey] = !isNaN(nextIndex) ? [] : {};
    }

    target = target[realKey];
  }

  const lastKey = keys[keys.length - 1];
  const lastIndex = Number(lastKey);
  target[!isNaN(lastIndex) ? lastIndex : lastKey] = value;
}
