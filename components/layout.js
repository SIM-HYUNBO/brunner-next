'use client';

import React, { useEffect, useState } from "react";
import Header from "./header";
import Footer from "./footer";
import Script from "next/script";
import Head from "next/head";
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

  const GoogleAdScript = () => {
    return (
      <>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3879149687745447"
          crossOrigin="anonymous"
        />
        <Script
          async
          custom-element="amp-auto-ads"
          src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"
        ></Script>
      </>
    );
  };

  return (
    <>
    <Head>
        <title>Noesis Pelagos - Brunner-Next</title>
        <meta name="description" content={`${constants.messages.SITE_DESCRIPTION}`} /> 
        <meta name="keywords" content="Digital Document Innovation - Brunner-Next" ></meta>
        <meta name="google-adsense-account" content="ca-pub-3879149687745447"></meta>
        <link rel="apple-touch-icon" type="image/png" href="/favicon.png?v=2"/>
        <link rel="icon" type="image/png" href="/favicon.png?v=2"/>
        <GoogleAdScript />
    </Head>
    <div className="Layout">
      <div className="flex flex-col w-full">
        <main className="flex-grow md:overflow-x: auto">
          <Header triggerMenuReload={triggerMenuReload} reloadSignal={reloadSignal} />
            {React.Children.map(children, child =>
              React.isValidElement(child) ? 
              React.cloneElement(child, { triggerMenuReload }) : 
              child
          )}
          <Footer />
        </main>
      </div>
    </div>
    </>
  );
}