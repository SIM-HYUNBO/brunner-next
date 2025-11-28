`use strict`;

import Layout from "@/components/core/client/frames/layout";
import UploadDailyOrderContent from "@/components/contents/pharmacy/uploadDailyOrderContent";

export default function DailyOrder() {
  return (
    <>
      <UploadDailyOrderContent />
    </>
  );
}

// 페이지 전용 Layout 적용
DailyOrder.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
