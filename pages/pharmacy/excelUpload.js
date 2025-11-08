`use strict`;

import useInitTheme from "@/hooks/useInitTheme";
import Layout from "@/components/core/client/frames/layout";
import UploadDailyOrderContent from "@/components/contents/pharmacy/uploadDailyOrderContent";

export default function ExcelUpload() {
  useInitTheme();

  return (
    <>
      <UploadDailyOrderContent />
    </>
  );
}

// 페이지 전용 Layout 적용
ExcelUpload.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
