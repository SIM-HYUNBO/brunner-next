import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import * as userInfo from "@/components/frames/userInfo";
import * as commonFunctions from "@/components/core/commonFunctions";
import Layout from "@/components/frames/layout";
import EDocContent from "@/components/eDoc/eDocContent";
import Loading from "@/components/core/client/loading";

export default function EDocument() {
  const router = useRouter();
  const { documentId } = router.query;

  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    const fetchDocData = async () => {
      try {
        setLoading(true);
        const docData = await commonFunctions.getDocumentData(
          userInfo.getLoginUserId(),
          documentId
        );
        setDocumentData(docData);
      } catch (err) {
        console.error("문서 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocData();
  }, [documentId]);

  return (
    <Layout>
      <div style={{ minHeight: "80vh" }}>
        {/* minHeight는 실제 콘텐츠 영역 높이에 맞게 조정 */}
        {loading || !documentData ? (
          <div className="flex-1 overflow-auto relative">
            {loading && <Loading />}
          </div>
        ) : (
          <EDocContent
            argDocumentId={documentId}
            argDocumentData={documentData}
          />
        )}
      </div>
    </Layout>
  );
}
