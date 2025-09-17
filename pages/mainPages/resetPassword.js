import useInitTheme from "@/hooks/useInitTheme";
import Layout from "@/components/frames/layout";
import ResetPasswordContent from "@/components/contents/resetPasswordContent";

export default function ResetPassword() {
  useInitTheme();

  return (
    <>
      <ResetPasswordContent />
    </>
  );
}

ResetPassword.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
