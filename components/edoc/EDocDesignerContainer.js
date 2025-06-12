
import { useState, useEffect } from 'react';
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import { useModal } from "@/components/brunnerMessageBox";
import RequestServer from "@/components/requestServer";

import EDocComponentPalette from './EDocComponentPalette';
import EDocEditorCanvas from './EDocEditorCanvas';
import EDocTopMenu from './EDocTopMenu'; // 상단 메뉴 컴포넌트 추가
import EDocPropertyEditor from './EDocPropertyEditor';  // 경로는 상황에 맞게 조정

export default function EDocDesignerContainer({ documentId }) {
  const { BrunnerMessageBox, openModal } = useModal();
  const [loading, setLoading] = useState(false);


  const [documentData, setDocumentData] = useState({
    id: documentId || null,
    title: '신규 기록서',
    components: [],
  });

  const [componentTemplates, setComponentTemplates] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);

  useEffect(() => {
    // 서버에서 템플릿 목록 불러오기
    async function fetchTemplates() {
    const jRequest = {
      commandName: constants.commands.COMMAND_EDOC_COMPONENT_TEMPLATES_SELECT_ALL,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo?.userId,
    };
    var jResponse = null;

    setLoading(true); // 데이터 로딩 시작
    jResponse = await RequestServer("POST", jRequest);
    setLoading(false); // 데이터 로딩 끝

    if (jResponse.error_code === 0) {
      setComponentTemplates(jResponse.templateList);
    } else openModal(jResponse.error_message);
  }
  
  fetchTemplates();

  }, []);

  useEffect(() => {
    if (documentId) {
      // 서버에서 문서 불러오기 (생략)
    }
  }, [documentId]);

  function handleComponentSelect(idx) {
    setSelectedComponentId(idx);
  }

  function handleComponentChange(updatedComponent) {
  if (selectedComponentId === null) return;

  setDocumentData((prev) => {
    const newComponents = [...prev.components];
    newComponents[selectedComponentId] = updatedComponent;
    return { ...prev, components: newComponents };
  });
  }

   function handleAddComponent(component) {
  const baseComponent = { ...component };

  // template_json 구조 파악
  const tpl = component.template_json;
  console.log("template_json:", component.template_json);

  // defaultProps 우선 적용
  const defaultRuntimeData = {};

  // runtime_data 자동 생성
  if (tpl.type === constants.edoc.COMPONENT_TYPE_TABLE) {
    defaultRuntimeData.cols = 3;
    defaultRuntimeData.rows = 3;
    defaultRuntimeData.data = Array.from({ length: 3 }, () => Array(3).fill(""));
    defaultRuntimeData.columns = ["ColumnHeader1", "ColumnHeader2", "ColumnHeader3"];
    baseComponent.runtime_data = defaultRuntimeData;
  } else if (tpl.type === constants.edoc.COMPONENT_TYPE_TEXT) {
    defaultRuntimeData.content = "여기에 텍스트를 입력하세요";
    baseComponent.runtime_data = defaultRuntimeData;
  } else if (tpl.type === constants.edoc.COMPONENT_TYPE_IMAGE) {
    defaultRuntimeData.src = "";
    baseComponent.runtime_data = defaultRuntimeData;
  } else if (tpl.type === constants.edoc.COMPONENT_TYPE_INPUT) {
    defaultRuntimeData.placeholder = "값을 입력하세요";
    baseComponent.runtime_data = defaultRuntimeData;
  }

  setDocumentData((prev) => ({
    ...prev,
    components: [...prev.components, baseComponent],
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

  return (
    <>
      {loading && (
        <div className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50`}>
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900`}></div>
        </div>
      )}
      <div className="flex h-screen bg-gray-100">
        <aside className="w-60 bg-white border-r border-gray-300 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">컴포넌트 템플릿</h2>
          <EDocComponentPalette
            templates={componentTemplates}
            onAddComponent={handleAddComponent}
          />
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
          <EDocPropertyEditor 
            component={selectedComponent} 
            onComponentChange={handleComponentChange} 
          />
        </aside>
      </div>
    </>
  );
}