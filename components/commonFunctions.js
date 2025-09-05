`use strict`;

import { useState, useRef, useEffect } from "react";
import * as constants from "./constants";
import * as InputComponent from "./eDoc/eDocComponent/eDocComponent_Input";
import * as TextComponent from "./eDoc/eDocComponent/eDocComponent_Text";
import * as ImageComponent from "./eDoc/eDocComponent/eDocComponent_Image";
import * as TableComponent from "./eDoc/eDocComponent/eDocComponent_Table";
import * as CheckListComponent from "./eDoc/eDocComponent/eDocComponent_CheckList";
import * as ButtonComponent from "./eDoc/eDocComponent/eDocComponent_Button";
import * as VideoComponent from "./eDoc/eDocComponent/eDocComponent_Video";
import RequestServer from "@/components/requestServer";

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
