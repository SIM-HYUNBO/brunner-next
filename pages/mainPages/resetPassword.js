import useInitTheme from "@/hooks/useInitTheme";
import Layout from "@/components/layout";
import ResetPasswordContent from "@/components/resetPasswordContent";

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
