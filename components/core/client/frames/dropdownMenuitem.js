// components/leftMenuItems.js
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import * as commonFunctions from "@/components/core/commonFunctions";

// 왼쪽 메뉴 전체 구성 반환 함수
export async function getDropdownMenuItems() {
  let items = [
    { label: "Home", href: "/", type: "item" },
    { label: "Brunner e-Doc", href: "/mainPages/eDocDesigner", type: "item" },
    { label: "Contact", href: "/mainPages/contact", type: "item" },
  ];

  if (userInfo.isAdminUser()) {
    items.push({
      label: "Service SQL",
      href: "/mainPages/serviceSql",
      type: "item",
    });
    items.push({
      label: "Brunner Flow",
      href: "/mainPages/workflow",
      type: "item",
    });
  }

  items.push({ type: "divider" });

  var documentList = await commonFunctions.getAdminDocumentList();
  documentList.forEach((doc) => {
    const hRef = `/${doc.id}`;
    items.push({
      label: doc.runtime_data?.title || "(제목 없음)",
      href: hRef,
      type: "item",
      // parent: sectionLabel,
    });
  });

  if (userInfo.getLoginUserId()) {
    items.push({ type: "divider" });

    documentList = await commonFunctions.getUsersDocumentList();
    documentList?.forEach((doc) => {
      if (
        (userInfo.isAdminUser() && doc.runtime_data?.isPublic === false) ||
        !userInfo.isAdminUser()
      ) {
        const hRef = `/${doc.id}`;
        items.push({
          label: doc.runtime_data?.title || "(제목 없음)",
          href: hRef,
          type: "item",
        });
      }
    });
  }

  return items;
}
