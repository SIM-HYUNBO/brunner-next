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
    
    <div className="flex flex-col md:flex-row min-h-screen bg-primary justify-center desktop:pl-10 w-full overflow-x-hidden">
      <LeftMenu
        documentList={documentList}
        reloadSignal={reloadSignal}
      />

      <DivContainer className="flex flex-col w-full desktop:px-4 mx-2 px-1">
        <main className="pt-16 flex-grow md:overflow-x: auto">
          <Header triggerLeftMenuReload={triggerLeftMenuReload} />
          {React.Children.map(children, child =>
            React.isValidElement(child)
              ? React.cloneElement(child, { triggerLeftMenuReload })
              : child
          )}
          <Footer />
        </main>
    </DivContainer>
    </div>
  );
}