`use strict`;

import Layout from "@/components/core/client/frames/layout";
import DynamicSqlContent from "@/components/contents/dynamicSqlContent";

export default function DynamicSqlPage() {
  return (
    <>
      <DynamicSqlContent />
    </>
  );
}

// 페이지 전용 Layout 적용
DynamicSqlPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
