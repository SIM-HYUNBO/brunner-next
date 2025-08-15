import Head from "next/head";
import Layout from "@/components/layout";
import BodySection from "@/components/bodySection";
import EDocContent from "@/components/eDoc/eDocContent"; // 기존 그대로 사용
import * as userInfo from "@/components/userInfo";

export default function EDocument({ documentData, pages }) {
  return (
    <Layout>
      <Head>
        <title>{documentData.runtime_data.title || "전자문서"}</title>
        <meta name="description" content="전자문서 내용을 확인하세요." />
      </Head>
      <BodySection>
        <EDocContent
          documentId={documentData.id}
          documentData={documentData}
          pages={pages}
        />
      </BodySection>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { documentId } = context.params;

  const constants = await import("@/components/constants");
  const RequestServer = (await import("@/components/requestServer")).default;

  const jRequest = {
    commandName: constants.commands.EDOC_DOCUMENT_SELECT_ONE,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userInfo.getLoginUserId(),
    documentId: documentId,
  };

  const baseUrl = getBaseUrl();
  const jResponse = await RequestServer(
    jRequest,
    "POST",
    `${baseUrl}/api/backendServer/`
  );

  if (jResponse.error_code !== 0 || !jResponse.documentData) {
    return { notFound: true };
  }

  const documentData = jResponse.documentData;

  const safePages = (
    documentData.pages || [
      {
        id: "page-1",
        components: documentData.components || [],
        runtime_data: documentData.runtime_data || {},
      },
    ]
  ).map((page) => ({
    ...page,
    documentData,
  }));

  return {
    props: {
      documentData,
      pages: safePages,
    },
  };
}

export function getBaseUrl() {
  if (process.env.NODE_ENV === "production")
    return "https://brunner-next.vercel.app";
  return "http://localhost:3000";
}
