`use strict`;

import SignupContent from "../../components/signupContent";
import Layout from "@/components/layout";
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
