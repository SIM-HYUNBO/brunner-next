`use strict`;

import React from "react";
import Script from "next/script";
import { useEffect } from "react";
import * as constants from "@/components/constants";
import Layout from "@/components/layout";
import BodySection from "@/components/bodySection";
import HomeContent from "@/pages/mainPages/content/homeContent";

// Home 페이지
export default function Home() {
  useEffect(() => {}, []);

  return (
    <Layout>
      <BodySection>
        <HomeContent></HomeContent>
      </BodySection>
    </Layout>
  );
}
