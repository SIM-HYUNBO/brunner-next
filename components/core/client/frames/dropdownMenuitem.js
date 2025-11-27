// components/leftMenuItems.js
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import * as commonFunctions from "@/components/core/commonFunctions";

// 왼쪽 메뉴 전체 구성 반환 함수
export async function getDropdownMenuItems() {
  let items = [
    {
      label: `${userInfo.getCurrentSystemName()} Home`,
      href: "/",
      type: "item",
    },
    { label: "Contact", href: "/mainPages/contact", type: "item" },
  ];

  const adminSectionLabel = "Admin's pages";
  if (userInfo.isAdminUser()) {
    items.push({ label: adminSectionLabel, type: "section" });
    items.push(
      {
        label: "Dynamic SQL",
        href: "/mainPages/dynamicSql",
        type: "item",
        parent: "Admin's pages",
      },
      {
        label: "Brunner e-Doc",
        href: "/mainPages/eDocDesigner",
        type: "item",
        parent: "Admin's pages",
      },
      {
        label: "Brunner Flow",
        href: "/mainPages/workflow",
        type: "item",
        parent: "Admin's pages",
      }
    );
  }

  var documentList = await commonFunctions.getAdminDocumentList(
    userInfo.getCurrentSystemCode()
  );

  documentList &&
    documentList.forEach((doc) => {
      const hRef = `/${doc.id}`;
      items.push({
        label: doc.runtime_data?.title || "(제목 없음)",
        href: hRef,
        type: "item",
      });
    });

  if (userInfo.getLoginUserId()) {
    const userSectionLabel = `${userInfo.getLoginName()}'s pages`;
    items.push({ label: userSectionLabel, type: "section" });
    documentList = await commonFunctions.getUsersDocumentList(
      userInfo.getCurrentSystemCode()
    );
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
          parent: userSectionLabel,
        });
      }
    });
  }

  if (userInfo.getLoginUserType() == constants.UserType.Pharmacy) {
    var hRef = `/pharmacy/excelUpload`;
    items.push({
      label: "Daily Order",
      href: hRef,
      type: "item",
    });
    hRef = `/pharmacy/supplierSetting`;
    items.push({
      label: "Supplier Setting",
      href: hRef,
      type: "item",
    });
  }
  return items;
}
