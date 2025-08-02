'use strict';
import { useState, useEffect } from 'react';

import Head from 'next/head';
import * as constants from '@/components/constants';
import * as userInfo from '@/components/userInfo';
import RequestServer from '@/components/requestServer';
import EDocEditorCanvas from '@/components/eDoc/eDocEditorCanvas';
import * as commonFunctions from '@/components/commonFunctions';

export default function EDocContent({ documentId }) {
  const [loading, setLoading] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (!documentId) return;

    const fetchDocument = async () => {
      setLoading(true);
      try {
        const jRequest = {
          commandName: constants.commands.EDOC_DOCUMENT_SELECT_ONE,
          systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
          userId: userInfo.getLoginUserId?.() || '',
          documentId,
        };

        const jResponse = await RequestServer(jRequest);

        if (jResponse.error_code === 0) {
          const doc = jResponse.documentData || {};
          setDocumentData(doc);

          const safePages = (doc.pages || [
            {
              id: 'page-1',
              components: doc.components || [],
              runtime_data: doc.runtime_data || {},
            },
          ]).map(page => ({
            ...page,
            documentData: doc,
          }));

          setPages(safePages);
        } else {
          alert(jResponse.error_message);
          setDocumentData(null);
          setPages([]);
        }
      } catch (error) {
        alert('문서 로딩 중 오류가 발생했습니다.');
        setDocumentData(null);
        setPages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 dark:border-white"></div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
        문서를 불러오는 중입니다...
      </div>
    );
  }

  const components = documentData.components || [];

  const title =
    components.find(c => c.type === constants.edocComponentType._TEXT)?.runtime_data?.text?.slice(0, 60) ||
    documentData.runtime_data.title ||
    '전자문서';

  const description =
    components
      .filter(
        c =>
          c.type === constants.edocComponentType._TEXT || c.type === constants.edocComponentType._INPUT
      )
      .map(c => c.runtime_data?.text || c.runtime_data?.label || '')
      .join(' ')
      .slice(0, 160) || '전자문서 내용 요약';

  const ogImage =
    components.find(
      c => c.type === constants.edocComponentType._IMAGE || c.type === constants.edocComponentType._VIDEO
    )?.runtime_data?.src || '/default-og-image.png';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* OpenGraph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={`https://brunner-next.vercel.app/edoc/${documentId}`}
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <h2 className={'page-title'}>
        {documentData.runtime_data.title}
      </h2>

      <main
        className="flex-grow edoc-designer-canvas"
        style={{ backgroundColor: documentData.runtime_data?.backgroundColor || '#f8f8f8' }}
      >
      {/* 도큐먼트 객체 (실행타임) */}
        <div
          className={`w-full`} /* 문서여백 p-1 고정 */
            style={{
              backgroundColor: documentData?.runtime_data?.backgroundColor || '#f8f8f8',
              padding: `${documentData.runtime_data.padding}px`, // 문서여백 1px 고정
            }}
        >
          {pages.map(page => (
            <EDocEditorCanvas
  key={page.id}
  pageData={page}
  isViewerMode={false} // ✅ 입력 허용
  mode="runtime"
  bindingData={commonFunctions.bindingData}
  onUpdateComponent={(updatedComponent) => {
    setPages(prevPages => {
      return prevPages.map(page => {
        if (page.id !== updatedComponent.pageId) return page;

        const newComponents = page.components.map(comp =>
          comp.id === updatedComponent.id ? updatedComponent : comp
        );
        return {
          ...page,
          components: newComponents,
        };
      });
    });
  }}
/>
          ))}
        </div>
      </main>
    </>
  );
}
