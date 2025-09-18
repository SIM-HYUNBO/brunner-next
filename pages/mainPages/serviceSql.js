`use strict`;

import Layout from "@/components/frames/layout";
import ServiceSqlContent from "../../components/contents/serviceSqlContent";
import useInitTheme from "@/hooks/useInitTheme";

export default function AdminPage() {
  useInitTheme();

  return (
    <>
      <ServiceSqlContent />
    </>
  );
}

// 페이지 전용 Layout 적용
AdminPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
