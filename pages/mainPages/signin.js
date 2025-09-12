import useInitTheme from "@/hooks/useInitTheme";
import Layout from "@/components/layout";
import SigninContent from "@/components/signinContent";

export default function Signin() {
  useInitTheme();

  return <SigninContent />;
}

Signin.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
