'use client';

import React, { useEffect, useState } from "react";
import Header from "./header";
import Footer from "./footer";
import DivContainer from "@/components/divContainer";
import RequestServer from "@/components/requestServer";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";

export default function Layout({ children, reloadSignal, triggerMenuReload }) {
  const [documentList, setDocumentList] = useState([]);

  const reloadMenu = async () => {
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
    reloadMenu();
  }, [reloadSignal]);

  return (
    <div className="flex 
                    flex-col 
                    md:flex-row 
                    min-h-screen 
                    bg-primary 
                    justify-center 
                    w-full 
                    overflow-x-hidden">
      <DivContainer className="flex 
                               flex-col 
                               w-full">
        <main className="flex-grow 
                         md:overflow-x: auto">
          <Header triggerMenuReload={triggerMenuReload} 
                  reloadSignal={reloadSignal} />
            {React.Children.map(children, child =>
              React.isValidElement(child) ? 
              React.cloneElement(child, { triggerMenuReload }) : 
              child
          )}
          <Footer />
        </main>
      </DivContainer>
    </div>
  );
}