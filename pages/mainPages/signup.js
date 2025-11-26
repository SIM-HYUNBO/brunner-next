`use strict`;

import SignupContent from "@/components/contents/signupContent";
import Layout from "@/components/core/client/frames/layout";

export default function Signup() {
  return (
    <>
      <SignupContent />
    </>
  );
}

Signup.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
