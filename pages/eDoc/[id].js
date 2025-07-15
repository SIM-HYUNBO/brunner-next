'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'

import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import RequestServer from "@/components/requestServer";
import DivContainer from "@/components/divContainer";
import EDocEditorCanvas from '@/components/eDoc/eDocEditorCanvas';
import * as commonFunctions from '@/components/commonFunctions';

export default function EDocViewerPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (!id) return;

    const fetchDocument = async () => {
      const jRequest = {
        commandName: constants.commands.COMMAND_EDOC_DOCUMENT_SELECT_ONE,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId?.() || '',
        documentId: id
      };

      setLoading(true);
      const jResponse = await RequestServer("POST", jRequest);
      setLoading(false);

      if (jResponse.error_code === 0) {
        const doc = jResponse.documentData || {};

        setDocumentData(doc);

        const safePages = (doc.pages || [
          {
            id: 'page-1',
            components: doc.components || [],
            runtime_data: doc.runtime_data || {}
          }
        ]).map(page => ({
          ...page,
          documentData: doc   // ✅ 여기서 안전하게 붙임
        }));

        setPages(safePages);
      } else {
        alert(jResponse.error_message);
      }
    };

    fetchDocument();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="flex h-screen items-center justify-center">
        문서를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Stock Quotes and Investment Information - Brunner-Next</title>
        <meta name="description" content="Brunner-Next provides real-time stock quotes. Make effective investments with real-time stock charts, investment strategies, stock news, and stock analysis tools."></meta>
        <meta name="keywords" content="Stock, Stock Quotes, Stock Analysis, US Stock Quotes, Stock Investment, Real-Time Stock Quotes, Stock Analysis Tools, 주식, 주식 시세, 주식 분석, 미국 주식 시세, 주식 투자, 실시간 주식 시세, 주식 종목 분석"></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
        <meta name="google-adsense-account" content="ca-pub-3879149687745447"></meta>
      </Head>
      <BodySection>
        <DivContainer>
          <div className={`w-full desktop:w-2/3 items-start text-left`}>
            <h2 className={`title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900`}>
              {`${documentData.title}`}
            </h2>
            <main className="min-h-screen bg-gray-100 p-8 overflow-auto">
              <div className="space-y-12">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    id={`viewer-canvas-${page.id}`}
                    className="border rounded shadow p-6 bg-white"
                  >
                    <EDocEditorCanvas
                      page={page}
                      isViewerMode={true}
                      mode="runtime" // ✅ 실행모드
                      bindingData={commonFunctions.bindingData}
                      documentData={page.documentData}
                    />
                  </div>
                ))}
              </div>
            </main>

          </div>
        </DivContainer>
      </BodySection>
    </Layout>
  );
}
