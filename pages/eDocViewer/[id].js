'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import RequestServer from "@/components/requestServer";

import EDocEditorCanvas from '@/components/edoc/EDocEditorCanvas';

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

        // ✅ 다중 페이지 구성 (예시: DB에 페이지별로 저장되어 있다고 가정)
        setPages(doc.pages || [
          {
            id: 'page-1',
            components: doc.components || [],
            runtime_data: doc.runtime_data || {}
          }
        ]);
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
    <main className="min-h-screen bg-gray-100 p-8 overflow-auto">
      <h1 className="text-2xl font-bold mb-6">
        {documentData.title} (ID: {documentData.id})
      </h1>

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
            />
          </div>
        ))}
      </div>
    </main>
  );
}
