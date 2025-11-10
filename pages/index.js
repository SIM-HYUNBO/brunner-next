`use strict`;

import React from "react";
import Layout from "@/components/core/client/frames/layout";
import HomeContent from "@/components/contents/homeContent";

// Home 페이지
export default function Home() {
  return <HomeContent />;
}

// 페이지 전용 Layout 적용
Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
