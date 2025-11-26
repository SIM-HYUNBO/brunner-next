`use strict`;

import Layout from "@/components/core/client/frames/layout";
import ContactContent from "@/components/contents/contactContent";

export default function Contact() {
  return (
    <>
      <ContactContent />
    </>
  );
}

// 페이지 전용 Layout 적용
Contact.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
