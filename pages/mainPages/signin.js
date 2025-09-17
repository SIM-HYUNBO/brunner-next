import useInitTheme from "@/hooks/useInitTheme";
import Layout from "@/components/frames/layout";
import SigninContent from "@/components/contents/signinContent";

export default function Signin() {
  useInitTheme();

  return (
    <>
      <SigninContent />
    </>
  );
}

Signin.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
