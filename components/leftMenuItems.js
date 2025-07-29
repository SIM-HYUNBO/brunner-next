import { useEffect, useState } from "react";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import RequestServer from "@/components/requestServer";

// 동적 문서 메뉴까지 포함해서 반환
export async function getLeftMenuItems() {
  let items = [
    { label: "Home", href: "/" },
    { label: "Page Designer", href: "/eDoc/eDocDesigner" },
    // 기타 고정 메뉴
  ];

  items = await getAdminDocumentList(items);

  items = await getUsersDocumentList(items);

  return items;
}

const getAdminDocumentList = async (items) => {
  const jRequest = {
    commandName: constants.commands.EDOC_ADMIN_DOCUMENT_SELECT_ALL,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userInfo.getLoginUserId(),
  };
  var jResponse = null;

  jResponse = await RequestServer(jRequest);
  if (jResponse.error_code === 0 && Array.isArray(jResponse.documentList)) {
    jResponse.documentList.forEach(doc => {
      const menuPath = doc.menu_path || `mainPages/edocument?documentId=${doc.id}`;
      items.push({ label: doc.runtime_data.title, href: menuPath });
    });
  }

  return items;
}

const getUsersDocumentList = async (items) => {
  if(!userInfo.getLoginUserId() || userInfo.isAdminUser()) {
    return items; // 관리자면 사용자 문서 목록은 필요 없음
  } 
  
  var jRequest = {
    commandName: constants.commands.EDOC_USER_DOCUMENT_SELECT_ALL,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userInfo.getLoginUserId(),
  };
  var jResponse = null;
  jResponse = await RequestServer(jRequest);
  if (jResponse.error_code === 0 && Array.isArray(jResponse.documentList)) {
    items.push({ type: "divider" });
    items.push({ label: `${userInfo.getLoginName()}'s Page`, type: "section" });
    jResponse.documentList.forEach(doc => {
      const menuPath = doc.runtime_data.menu_path || `mainPages/edocument?documentId=${doc.id}`;
      items.push({ label: doc.runtime_data.title, href: menuPath });
    });
  }
  return items;
}