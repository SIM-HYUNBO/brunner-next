import { useState, useEffect } from 'react';
import TopMenu from './TopMenu';
import DocComponentPalette from './DocComponentPalette';
import DocEditorCanvas from './DocEditorCanvas';

export default function DocumentDesignerContainer({ documentId }) {
  const [documentData, setDocumentData] = useState({
    id: documentId || null,
    title: '신규 기록서',
    components: [],
  });

  // 기존 문서 로드 (예시)
  useEffect(() => {
    if (documentId) {
      fetch(`/api/documents/${documentId}`)
        .then((res) => {
          if (!res.ok) throw new Error('문서 로드 실패');
          return res.json();
        })
        .then((data) => setDocumentData(data))
        .catch((err) => {
          console.error(err);
          alert('문서 로드 중 오류가 발생했습니다.');
        });
    } else {
      // 신규 문서 초기화
      setDocumentData({
        id: null,
        title: '신규 기록서',
        components: [],
      });
    }
  }, [documentId]);

  function handleAddComponent(component) {
    setDocumentData((prev) => ({
      ...prev,
      components: [...prev.components, component],
    }));
  }

  // 새 문서 생성
  const handleNewDocument = () => {
    if (
      window.confirm(
        '현재 작업 중인 문서가 저장되지 않을 수 있습니다. 새 문서를 생성하시겠습니까?'
      )
    ) {
      setDocumentData({
        id: null,
        title: '신규 기록서',
        components: [],
      });
    }
  };

  // 문서 열기 (예시: prompt로 문서 ID 입력받기)
  const handleOpenDocument = () => {
    const id = window.prompt('열 문서 ID를 입력하세요');
    if (id) {
      // 실제로는 라우팅하거나 상태를 변경해서 로드하도록 해야 함
      // 여기선 간단히 fetch 후 setDocumentData 호출해도 됨
      fetch(`/api/documents/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('문서 로드 실패');
          return res.json();
        })
        .then((data) => setDocumentData(data))
        .catch(() => alert('해당 문서를 찾을 수 없습니다.'));
    }
  };

  // 문서 저장 (예시: POST or PUT 호출)
  const handleSaveDocument = () => {
    // 저장 API 호출 예시 (id 유무에 따라 create/update)
    const method = documentData.id ? 'PUT' : 'POST';
    const url = documentData.id
      ? `/api/documents/${documentData.id}`
      : '/api/documents';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(documentData),
    })
      .then((res) => {
        if (!res.ok) throw new Error('저장 실패');
        return res.json();
      })
      .then((savedData) => {
        alert('문서가 저장되었습니다.');
        setDocumentData(savedData); // 저장 후 서버에서 리턴한 최신 데이터로 갱신
      })
      .catch(() => alert('문서 저장 중 오류가 발생했습니다.'));
  };

  // PDF 출력 (예시: 새 창으로 PDF 뷰어 열기)
  const handleExportPdf = () => {
    if (!documentData.id) {
      alert('저장된 문서만 PDF로 출력할 수 있습니다.');
      return;
    }
    window.open(`/api/documents/${documentData.id}/export-pdf`, '_blank');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopMenu
        onNewDocument={handleNewDocument}
        onOpenDocument={handleOpenDocument}
        onSaveDocument={handleSaveDocument}
        onExportPdf={handleExportPdf}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-60 bg-white border-r border-gray-300 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">컴포넌트 템플릿</h2>
          <DocComponentPalette onAddComponent={handleAddComponent} />
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-6">{documentData.title}</h1>
          <DocEditorCanvas components={documentData.components} />
        </main>

        <aside className="w-80 bg-white border-l border-gray-300 p-4 hidden md:block">
          <h2 className="text-lg font-semibold">속성창 (예정)</h2>
        </aside>
      </div>
    </div>
  );
}