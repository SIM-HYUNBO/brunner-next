`use strict`;

import useInitTheme from "@/hooks/useInitTheme";
import Layout from "@/components/core/client/frames/layout";
import SupplierSettingContent from "@/components/contents/pharmacy/supplierSettingContent";
export default function SupplierSetting() {
  useInitTheme();

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
