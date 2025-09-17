`use strict`;

import SignupContent from "../../components/contents/signupContent";
import Layout from "@/components/frames/layout";
import useInitTheme from "@/hooks/useInitTheme";

export default function Signup() {
  useInitTheme();

  return (
    <>
      <SignupContent />
    </>
  );
}

Signup.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
