"use strict";
import { useState, useEffect } from "react";
import * as constants from "@/components/core/constants";
import * as commonFunctions from "@/components/core/commonFunctions";
import * as userInfo from "@/components/core/client/frames/userInfo";
import EDocEditorCanvas from "@/components/eDoc/eDocEditorCanvas";
import BrunnerBoard from "@/components/core/client/brunnerBoard";
import { Input, Button, Table } from "antd";

export default function EDocContent({ argDocumentId, argDocumentData }) {
  const [documentData, setDocumentData] = useState(null);

  // props가 변경되면 상태도 업데이트 (필요하다면)
  useEffect(() => {
    async function fetchDocData(documentId) {
      if (!documentId) return; // id 없으면 실행 안 함
      const docData = await commonFunctions.getDocumentData(
        userInfo.getCurrentSystemCode(),
        userInfo.getLoginUserId(),
        documentId
      );
      setDocumentData(docData);
    }

    if (!argDocumentData) fetchDocData(argDocumentId); // 함수 호출
    else setDocumentData(argDocumentData);
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
        no document loaded ...
      </div>
    );
  }

  const components = documentData.components || [];

  const title =
    components
      .find((c) => c.type === constants.edocComponentType._TEXT)
      ?.runtime_data?.text?.slice(0, 60) ||
    documentData.runtime_data?.title ||
    "제목없음";

  const description =
    components
      .filter(
        (c) =>
          c.type === constants.edocComponentType._TEXT ||
          c.type === constants.edocComponentType._INPUT
      )
      .map((c) => c.runtime_data?.text || c.runtime_data?.label || "")
      .join(" ")
      .slice(0, 160) || "내용 요약";

  const ogImage =
    components.find(
      (c) =>
        c.type === constants.edocComponentType._IMAGE ||
        c.type === constants.edocComponentType._VIDEO
    )?.runtime_data?.src || "/default-og-image.png";

  return (
    <>
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
              isViewerMode={false}
              mode="runtime"
              documentData={documentData}
              onUpdateComponent={(updatedComponent) => {
                setDocumentData((prevDoc) => {
                  const newPages = prevDoc.pages.map((p) => {
                    if (p.id !== updatedComponent.pageId) return p;
                    const newComponents = p.components.map((comp) =>
                      comp.id === updatedComponent.id ? updatedComponent : comp
                    );
                    return { ...p, components: newComponents };
                  });

                  return { ...prevDoc, pages: newPages }; // ✅ pages만 업데이트
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
