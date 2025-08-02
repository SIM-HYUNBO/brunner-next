// components/leftMenuItems.js
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import RequestServer from "@/components/requestServer";

// 왼쪽 메뉴 전체 구성 반환 함수
export async function getDropdownMenuItems() {
  let items = [
    { label: "Home", href: "/", type: "item" },
    { label: "Page Designer", href: "/mainPages/eDocDesigner", type: "item" },
    { label: "Contact", href: "/mainPages/contact", type: "item" },
  ]; 

  if (userInfo.isAdminUser()) {
    items.push({ label: "Administration", href: "/mainPages/administration", type: "item" });
  }

  items.push({ type: "divider" });

  items = await getAdminDocumentList(items);

  if (userInfo.getLoginUserId() && !userInfo.isAdminUser()) {
    items = await getUsersDocumentList(items);
  }
  
  return items;
}

const getAdminDocumentList = async (items) => {
  const jRequest = {
    commandName: constants.commands.EDOC_ADMIN_DOCUMENT_SELECT_ALL,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userInfo.getLoginUserId(),
  };

  const jResponse = await RequestServer(jRequest);
  if (jResponse.error_code === 0 && Array.isArray(jResponse.documentList)) {
    const sectionLabel = "Admin's pages";
    items.push({ label: sectionLabel, type: "section" });

    jResponse.documentList.forEach((doc) => {
      const hRef = `/mainPages/edocument?documentId=${doc.id}`;
      items.push({
        label: doc.runtime_data?.title || "(제목 없음)",
        href: hRef,
        type: "item",
        parent: sectionLabel,
      });
    });
  }

  return items;
};

const getUsersDocumentList = async (items) => {
  const userId = userInfo.getLoginUserId();
  if (!userId || userInfo.isAdminUser()) return items;

  const jRequest = {
    commandName: constants.commands.EDOC_USER_DOCUMENT_SELECT_ALL,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userId,
  };

  const jResponse = await RequestServer(jRequest);
  if (jResponse.error_code === 0 && Array.isArray(jResponse.documentList)) {
    const sectionLabel = `${userInfo.getLoginName()}'s pages`;

    items.push({ label: sectionLabel, type: "section" });

    jResponse.documentList.forEach((doc) => {
      const hRef = `/mainPages/edocument?documentId=${doc.id}`;
      items.push({
        label: doc.runtime_data?.title || "(제목 없음)",
        href: hRef,
        type: "item",
        parent: sectionLabel,
      });
    });
  }

  return items;
};