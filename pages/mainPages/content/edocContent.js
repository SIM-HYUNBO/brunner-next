'use strict'
import { useState, useEffect } from 'react';

import DivContainer from "@/components/divContainer";
import GoverningMessage from "@/components/governingMessage";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import RequestServer from "@/components/requestServer";
import EDocEditorCanvas from '@/components/eDoc/eDocEditorCanvas';
import * as commonFunctions from '@/components/commonFunctions';
import { isMobile } from 'react-device-detect';

export default function EDocContent({ documentId }) {
  const [loading, setLoading] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (!documentId) return;

    const fetchDocument = async () => {
      const jRequest = {
        commandName: constants.commands.EDOC_DOCUMENT_SELECT_ONE,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId?.() || '',
        documentId: documentId
      };

      setLoading(true);
      const jResponse = await RequestServer(jRequest);
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
  }, [documentId]);

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
    <>
  <DivContainer className="flex flex-col desktop:flex-row">
    <div className={`w-full desktop:w-2/3 items-start text-left`}>
      <h2 className={`title-font sm:text-4xl text-3xl mb-10 font-medium text-green-900`}>
        {`${documentData.title}`}
      </h2>
    </div>

    {pages.map((page) => (
        <EDocEditorCanvas
          page={page}
          isViewerMode={true}
          mode="runtime"
          bindingData={commonFunctions.bindingData}
          documentData={page.documentData}
          style={{ width: "100%", minWidth: 0, overflow: "visible" }} // ✅ 스타일 props로 전달
        />
    ))}

    {!isMobile && (
      <div className="items-center">
        {/* {<ClipsContentAnimation />} */}
      </div>
    )}
  </DivContainer>
</>

  );
}
