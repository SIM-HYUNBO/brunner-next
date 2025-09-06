"use strict";
import { useState, useEffect } from "react";
import Head from "next/head";
import * as constants from "@/components/constants";
import * as commonFunctions from "@/components/commonFunctions";
import * as userInfo from "@/components/userInfo";
import EDocEditorCanvas from "@/components/eDoc/eDocEditorCanvas";
import BrunnerBoard from "@/components/brunnerBoard";

export default function EDocContent({ argDocumentId, argDocumentData }) {
  const [documentData, setDocumentData] = useState(null);

  // props가 변경되면 상태도 업데이트 (필요하다면)
  useEffect(() => {
    async function fetchDocData(documentId) {
      if (!documentId) return; // id 없으면 실행 안 함
      const docData = await commonFunctions.getDocumentData(
        userInfo.getLoginUserId(),
        documentId
      );
      setDocumentData(docData);
    }

    if (!argDocumentData) fetchDocData(argDocumentId); // 함수 호출
  }, [argDocumentId]);

  if (!documentData) {
    return (
      <div
        className="flex 
                      h-screen 
                      items-center 
                      justify-center 
                      bg-white 
                      dark-bg-color 
                      text-gray-900 
                      dark:text-gray-100"
      >
        문서를 불러오는 중입니다...
      </div>
    );
  }

  const components = documentData.components || [];

  const title =
    components
      .find((c) => c.type === constants.edocComponentType._TEXT)
      ?.runtime_data?.text?.slice(0, 60) ||
    documentData.runtime_data?.title ||
    "전자문서";

  const description =
    components
      .filter(
        (c) =>
          c.type === constants.edocComponentType._TEXT ||
          c.type === constants.edocComponentType._INPUT
      )
      .map((c) => c.runtime_data?.text || c.runtime_data?.label || "")
      .join(" ")
      .slice(0, 160) || "전자문서 내용 요약";

  const ogImage =
    components.find(
      (c) =>
        c.type === constants.edocComponentType._IMAGE ||
        c.type === constants.edocComponentType._VIDEO
    )?.runtime_data?.src || "/default-og-image.png";

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
          content={`https://brunner-next.vercel.app/mainPages/edocument?documentId=${documentData.id}`}
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <h2 className={"page-title"}>{documentData.runtime_data?.title}</h2>

      <main
        className="flex-grow edoc-designer-canvas"
        style={{
          backgroundColor:
            documentData.runtime_data?.backgroundColor || "#f8f8f8",
        }}
      >
        {/* 도큐먼트 객체 (실행타임) */}
        <div
          className={`w-full`}
          style={{
            backgroundColor:
              documentData?.runtime_data?.backgroundColor || "#f8f8f8",
            padding: `${documentData.runtime_data?.padding}px`,
          }}
        >
          {documentData.pages?.map((page) => (
            <EDocEditorCanvas
              key={page.id}
              pageData={page}
              isViewerMode={false} // 입력 허용
              mode="runtime"
              documentData={documentData}
              onUpdateComponent={(updatedComponent) => {
                setPages((prevPages) => {
                  return prevPages.map((page) => {
                    if (page.id !== updatedComponent.pageId) return page;

                    const newComponents = page.components.map((comp) =>
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
        <div className={`flex w-full mt-10 px-2 readonly semi-text-bg-color`}>
          <BrunnerBoard boardType={`${documentData.id}`} />
        </div>
      </main>
    </>
  );
}
