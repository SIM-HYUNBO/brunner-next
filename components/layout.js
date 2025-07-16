import React, { useEffect, useState } from "react";
import LeftMenu from "./leftMenu";
import Header from "./header";
import Footer from "./footer";
import RequestServer from "@/components/requestServer";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";

export default function Layout({ children }) {
  const [documentList, setDocumentList] = useState([]);
  const [reloadSignal, setReloadSignal] = useState(0);

  const reloadLeftMenu = async () => {
    const jRequest = {
      commandName: constants.commands.COMMAND_EDOC_DOCUMENT_SELECT_ALL,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
    };
    const jResponse = await RequestServer("POST", jRequest);

    if (jResponse.error_code === 0) {
      setDocumentList(jResponse.documentList || []);
    } else {
      console.error(jResponse.error_message);
    }
  };

  useEffect(() => {
    reloadLeftMenu();
  }, []);

  return (
    <div className="flex bg-primary min-h-screen justify-center">
      {/* reloadSignal만 넘김 */}
      <LeftMenu reloadSignal={reloadSignal} />

      <div className="px-2 w-full desktop:w-3/4 ml-5">
        <Header />
        <main>
          {React.Children.map(children, child =>
            React.isValidElement(child)
              ? React.cloneElement(child, { triggerMenuReload: () => setReloadSignal(prev => prev + 1) })
              : child
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}