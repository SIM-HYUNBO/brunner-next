`use strict`;

import Layout from "@/components/layout";
import ServiceSqlContent from "../../components/serviceSqlContent";

export default function AdminPage() {
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
