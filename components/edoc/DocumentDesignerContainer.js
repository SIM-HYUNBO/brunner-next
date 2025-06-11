import { useState, useEffect } from 'react';
import DocComponentPalette from './DocComponentPalette';
import DocEditorCanvas from './DocEditorCanvas';

export default function DocumentDesignerContainer({ documentId }) {
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
        <DocComponentPalette onAddComponent={handleAddComponent} />
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">{documentData.title}</h1>
        <DocEditorCanvas
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