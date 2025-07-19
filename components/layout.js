'use client';

import React, { useEffect, useState } from "react";
import LeftMenu from "./leftMenu";
import Header from "./header";
import Footer from "./footer";
import DivContainer from "@/components/divContainer";
import RequestServer from "@/components/requestServer";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";

export default function Layout({ children, reloadSignal, triggerLeftMenuReload }) {
  const [documentList, setDocumentList] = useState([]);

  const reloadLeftMenu = async () => {
    const jRequest = {
      commandName: constants.commands.EDOC_USER_DOCUMENT_SELECT_ALL,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
    };
    const jResponse = await RequestServer(jRequest);

    if (jResponse.error_code === 0) {
      setDocumentList(jResponse.documentList || []);
    } else {
      console.error(jResponse.error_message);
    }
  };

  useEffect(() => {
    reloadLeftMenu();
  }, [reloadSignal]);

  return (
    <div className="flex bg-primary justify-center">
      {/* ✅ LeftMenu 그대로 */}
      <LeftMenu
        documentList={documentList}
        reloadSignal={reloadSignal}
      />

      {/* ✅ 오른쪽 영역 */}
      <DivContainer>
        {/* ✅ Header */}
        <Header triggerLeftMenuReload={triggerLeftMenuReload} />

        {/* ✅ main 제거 & 그냥 children */}
        {React.Children.map(children, child =>
          React.isValidElement(child)
            ? React.cloneElement(child, { triggerLeftMenuReload })
            : child
        )}
      <Footer />
      </DivContainer>
      </div>
  );
}
