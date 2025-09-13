`use strict`;

import useInitTheme from "@/hooks/useInitTheme";

import Layout from "@/components/layout";
import ContactContent from "@/components/contactContent";

export default function Contact() {
  useInitTheme();

  return <ContactContent />;
}

// 페이지 전용 Layout 적용
Contact.getLayout = function getLayout(page) {
  return (
    <Layout>
      {page}
    </Layout>
  );
};
