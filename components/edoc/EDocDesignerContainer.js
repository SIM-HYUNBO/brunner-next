import { useState, useEffect } from 'react';
import EDocComponentPalette from './EDocComponentPalette';
import EDocEditorCanvas from './EDocEditorCanvas';
import EDocTopMenu from './EDocTopMenu'; // 상단 메뉴 컴포넌트 추가

export default function EDocDesignerContainer({ documentId }) {
  const [documentData, setDocumentData] = useState({
    id: documentId || null,
    title: '신규 기록서',
    components: [],
  });

  const [selectedComponentId, setSelectedComponentId] = useState(null);

  useEffect(() => {
    if (documentId) {
      // 서버에서 문서 불러오기 (생략)
    }
  }, [documentId]);

  function handleAddComponent(component) {
    setDocumentData((prev) => ({
      ...prev,
      components: [...prev.components, component],
    }));
  }

  function handleComponentSelect(idx) {
    setSelectedComponentId(idx);
  }

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

  // 선택된 컴포넌트 데이터
  const selectedComponent = selectedComponentId !== null ? documentData.components[selectedComponentId] : null;

  // 속성창 UI 예시
  function renderProperties() {
  if (!selectedComponent) return <p>컴포넌트를 선택하세요.</p>;

  switch (selectedComponent.type) {
    case 'text':
      return (
        <div>
          <label>내용 수정:</label>
          <textarea
            value={selectedComponent.content}
            onChange={(e) => {
              const newContent = e.target.value;
              setDocumentData((prev) => {
                const newComponents = [...prev.components];
                newComponents[selectedComponentId] = {
                  ...newComponents[selectedComponentId],
                  content: newContent,
                };
                return { ...prev, components: newComponents };
              });
            }}
            rows={4}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
      );

    case 'table':
      return (
        <div>
          <label>행 수:</label>
          <input
            type="number"
            min={1}
            value={selectedComponent.rows}
            onChange={(e) => {
              const rows = parseInt(e.target.value) || 1;
              setDocumentData((prev) => {
                const newComponents = [...prev.components];
                newComponents[selectedComponentId] = { ...newComponents[selectedComponentId], rows };
                return { ...prev, components: newComponents };
              });
            }}
            className="w-full border border-gray-300 rounded p-1 mb-2"
          />
          <label>열 수:</label>
          <input
            type="number"
            min={1}
            value={selectedComponent.cols}
            onChange={(e) => {
              const cols = parseInt(e.target.value) || 1;
              setDocumentData((prev) => {
                const newComponents = [...prev.components];
                newComponents[selectedComponentId] = { ...newComponents[selectedComponentId], cols };
                return { ...prev, components: newComponents };
              });
            }}
            className="w-full border border-gray-300 rounded p-1"
          />
        </div>
      );

    case 'image':
      return (
        <div>
          <label>이미지 URL:</label>
          <input
            type="text"
            value={selectedComponent.src}
            onChange={(e) => {
              const src = e.target.value;
              setDocumentData((prev) => {
                const newComponents = [...prev.components];
                newComponents[selectedComponentId] = { ...newComponents[selectedComponentId], src };
                return { ...prev, components: newComponents };
              });
            }}
            className="w-full border border-gray-300 rounded p-2"
          />
          {selectedComponent.src && (
            <img
              src={selectedComponent.src}
              alt="선택된 이미지"
              className="mt-2 max-w-full h-auto border"
            />
          )}
        </div>
      );

    case 'input':
      return (
        <div>
          <label>플레이스홀더:</label>
          <input
            type="text"
            value={selectedComponent.placeholder || ''}
            onChange={(e) => {
              const placeholder = e.target.value;
              setDocumentData((prev) => {
                const newComponents = [...prev.components];
                newComponents[selectedComponentId] = { ...newComponents[selectedComponentId], placeholder };
                return { ...prev, components: newComponents };
              });
            }}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
      );

    default:
      return <p>속성 편집이 지원되지 않는 컴포넌트입니다.</p>;
  }
}

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-60 bg-white border-r border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">컴포넌트 템플릿</h2>
        <EDocComponentPalette onAddComponent={handleAddComponent} />
      </aside>

      <main className="flex-1 p-6 overflow-auto">
      <EDocTopMenu         
        onNewDocument={handleNewDocument}
        onOpenDocument={handleOpenDocument}
        onSaveDocument={handleSaveDocument}
        onExportPdf={handleExportPdf} 
        documentData={documentData} 
        setDocumentData={setDocumentData} />
        
        <h1 className="text-2xl font-bold mb-6">{documentData.title}</h1>
        <EDocEditorCanvas
          components={documentData.components}
          selectedComponentId={selectedComponentId}
          onComponentSelect={handleComponentSelect}
        />
      </main>

      <aside className="w-80 bg-white border-l border-gray-300 p-4 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">속성창</h2>
        {renderProperties()}
      </aside>
    </div>
  );
}