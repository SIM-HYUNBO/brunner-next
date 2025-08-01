// components/leftMenuItems.js
import * as constants from "@/components/constants";
import RequestServer from "@/components/requestServer";

// 왼쪽 메뉴 전체 구성 반환 함수
export async function getDropdownMenuItems() {
  if (typeof window === "undefined") {
    // SSR 환경이면 localStorage 접근 불가 → 빈 목록 반환
    return [];
  }

  const loginUserId = localStorage.getItem("userId");
  const loginUserName = localStorage.getItem("userName");
  const isAdmin = localStorage.getItem("adminFlag") === "true";

  let items = [
    { label: "Home", href: "/", type: "item" },
    { label: "Page Designer", href: "/mainPages/eDocDesigner", type: "item" },
    { label: "Contact", href: "/mainPages/contact", type: "item" },
  ];

  if (isAdmin) {
    items.push({ label: "Administration", href: "/mainPages/administration", type: "item" });
  }

  items.push({ type: "divider" });

  items = await getAdminDocumentList(items, loginUserId);

  if (loginUserId && !isAdmin) {
    items = await getUsersDocumentList(items, loginUserId, loginUserName);
  }

  return items;
}

const getAdminDocumentList = async (items, userId) => {
  if (!userId) return items;

  const jRequest = {
    commandName: constants.commands.EDOC_ADMIN_DOCUMENT_SELECT_ALL,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userId,
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

const getUsersDocumentList = async (items, userId, userName) => {
  if (!userId) return items;

  const jRequest = {
    commandName: constants.commands.EDOC_USER_DOCUMENT_SELECT_ALL,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userId,
  };

  const jResponse = await RequestServer(jRequest);
  if (jResponse.error_code === 0 && Array.isArray(jResponse.documentList)) {
    const sectionLabel = `${userName || "User"}'s Page`;
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