"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import Head from "next/head";
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import Header from "@/components/core/client/frames/header";
import Footer from "@/components/core/client/frames/footer";
import BodySection from "@/components/core/client/frames/bodySection";
import { RequestServer } from "@/components/core/client/requestServer";

export default function Layout({ children }) {
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
      <BodySection>
        <Head>
          <title>Noesis Pelagos - Brunner-Next</title>
          <meta
            name="description"
            content={`${constants.messages.SITE_DESCRIPTION}`}
          />
          <meta
            name="keywords"
            content="Digital Document Innovation - Brunner-Next"
          ></meta>
          <meta
            name="google-adsense-account"
            content="ca-pub-3879149687745447"
          ></meta>
          <link
            rel="apple-touch-icon"
            type="image/png"
            href="/favicon.png?v=2"
          />
          <link rel="icon" type="image/png" href="/favicon.png?v=2" />
          <GoogleAdScript />
        </Head>
        <div className="Layout">
          <div className="flex flex-col w-full">
            <main className="flex-grow md:overflow-x: auto overflow-y:auto py-10">
              <Header />
              {React.Children.map(children, (child) =>
                React.isValidElement(child) ? React.cloneElement(child) : child
              )}
              <Footer />
            </main>
          </div>
        </div>
      </BodySection>
    </>
  );
}
