`use strict`;

import Layout from "@/components/core/client/frames/layout";
import UserAccountContent from "@/components/contents/userAccountContent";

export default function UserAccount() {
  return (
    <>
      <UserAccountContent />
    </>
  );
}

// 페이지 전용 Layout 적용
UserAccount.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
