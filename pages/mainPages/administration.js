`use strict`;

import Layout from "@/components/layout";
import AdminContent from "../../components/adminContent";

export default function AdminPage() {
  return <AdminContent />;
}

// 페이지 전용 Layout 적용
AdminPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
