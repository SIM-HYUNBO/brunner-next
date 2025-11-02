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

import { RequestServer } from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { currentSystemCode } from "../contents/signinContent";

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

export async function getDocumentData(systemCode, userId, documentId) {
  try {
    const jRequest = {
      commandName: constants.commands.EDOC_DOCUMENT_SELECT_ONE,
      systemCode: systemCode,
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
    systemCode: currentSystemCode ?? constants.SystemCode.defaultSystem,
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
    systemCode: currentSystemCode,
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

// ==========================
// nodes 전용 label 탐색 get/set
// ==========================

export function getByPath(obj, path) {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (current == null) return undefined;

    // nodes 다음 레벨이면 배열일 때 UUID 또는 label 탐색
    if (i === 1 && Array.isArray(current)) {
      // nodes 다음
      if (/^[0-9a-fA-F-]{36}$/.test(key)) {
        current = current.find((n) => n.id === key);
        continue;
      }
      current = current.find((n) => n.data?.label === key);
      continue;
    }

    // 배열 내 숫자 인덱스
    const index = Number(key);
    if (Array.isArray(current) && !isNaN(index)) {
      current = current[index];
      continue;
    }

    // 일반 객체 접근
    current = current[key];
  }

  return current;
}

export function setByPath(obj, path, value) {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    // nodes 다음 레벨이면 배열에서 UUID/label 탐색
    if (i === 1 && Array.isArray(current)) {
      let found;

      // UUID 탐색
      if (/^[0-9a-fA-F-]{36}$/.test(key)) {
        found = current.find((n) => n.id === key);
        if (!found) {
          found = { id: key };
          current.push(found);
        }
        current = found;
        continue;
      }

      // label 탐색
      found = current.find((n) => n.data?.label === key);
      if (!found) {
        found = { id: key, data: { label: key } };
        current.push(found);
      }
      current = found;
      continue;
    }

    // 배열 숫자 인덱스
    const index = Number(key);
    if (Array.isArray(current) && !isNaN(index)) {
      if (!current[index]) current[index] = {};
      current = current[index];
      continue;
    }

    // 일반 객체
    if (!current[key]) current[key] = {};
    current = current[key];
  }

  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
}
