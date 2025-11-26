`use strict`;

import Layout from "@/components/core/client/frames/layout";
import SupplierSettingContent from "@/components/contents/pharmacy/supplierSettingContent";
export default function SupplierSetting() {
  return (
    <>
      <SupplierSettingContent />
    </>
  );
}

// 페이지 전용 Layout 적용
SupplierSetting.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
