import { useState, useEffect } from "react";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import * as commonFunctions from "@/components/commonFunctions";

import Head from "next/head";
import Layout from "@/components/layout";
import BodySection from "@/components/bodySection";
import EDocContent from "@/components/eDoc/eDocContent"; // 기존 그대로 사용

export default function EDocument({ documentId }) {
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!documentId) return; // documentId 없으면 실행 안 함

    const fetchDocData = async () => {
      try {
        setLoading(true);
        const docData = await commonFunctions.getDocumentData(
          userInfo.getLoginUserId(),
          documentId
        );
        setLoading(false);
        setDocumentData(docData);
      } catch (err) {
        console.error("문서 데이터 로드 실패:", err);
      }
    };

    fetchDocData();
  }, [documentId]);

  if (loading) {
    return (
      <div
        className="flex 
                      h-screen 
                      items-center 
                      justify-center 
                      general-bg-color"
      >
        <div
          className="animate-spin 
                        rounded-full 
                        h-12 
                        w-12 
                        border-t-2 
                        border-b-2 
                        border-gray-800 
                        dark:border-white"
        ></div>
      </div>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{documentData?.runtime_data?.title || "전자문서"}</title>
        <meta name="description" content="전자문서 내용을 확인하세요." />
      </Head>
      <BodySection>
        <EDocContent argDocumentData={documentData} />
      </BodySection>
    </Layout>
  );
}

/* getServerSideProps는 documentId를 EDocument 컴포넌트로 props 형태로 넘겨주는 역할을 함
   pages/[documentId].js 같은 동적 라우팅 페이지는 
   URL에서 파라미터(context.params.documentId)를 가져와야 컴포넌트에서 사용할 수 있음.
   일반적인 React에서는 useParams() 같은 걸 쓰지만, 
   Next.js는 서버사이드 렌더링(SSR)을 지원하기 때문에 
   빌드/요청 시점에 파라미터를 해석해서 props로 넘겨주는 방식을 사용함. 
*/

export async function getServerSideProps(context) {
  const { documentId } = context.params; // edoc/123 → documentId = "123"

  return { props: { documentId: documentId } }; // EDocument 컴포넌트로 params 전달
}
