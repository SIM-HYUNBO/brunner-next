`use strict`;

import Layout from "@/components/core/client/frames/layout";
import ResetPasswordContent from "@/components/contents/resetPasswordContent";

export default function ResetPassword() {
  return (
    <>
      <ResetPasswordContent />
    </>
  );
}

ResetPassword.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
