import { useEffect, useState } from "react";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import RequestServer from "@/components/requestServer";

// 동적 문서 메뉴까지 포함해서 반환
export async function getLeftMenuItems() {
  const items = [
    { label: "Home", href: "/" },
    { label: "Page Designer", href: "/eDoc/eDocDesigner" },
    // 기타 고정 메뉴
  ];

  // 문서 목록 동적 추가
  const jRequest = {
    commandName: constants.commands.COMMAND_EDOC_DOCUMENT_SELECT_ALL,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userInfo.getLoginUserId(),
  };
  const jResponse = await RequestServer("POST", jRequest);

  if (jResponse.error_code === 0 && Array.isArray(jResponse.documentList)) {
    items.push({ type: "divider" });
    items.push({ label: "My Page", type: "section" });
    jResponse.documentList.forEach(doc => {
      const menuPath = doc.menu_path || `mainPages/edocument?documentId=${doc.id}`;
      items.push({ label: doc.title, href: menuPath });
    });
  }
  return items;
}