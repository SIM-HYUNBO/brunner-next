`use strict`;

import useInitTheme from "@/hooks/useInitTheme";
import Layout from "@/components/frames/layout";
import ContactContent from "@/components/contents/contactContent";

export default function Contact() {
  useInitTheme();

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
