
import { useState, useEffect } from 'react';
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import { useModal } from "@/components/brunnerMessageBox";
import RequestServer from "@/components/requestServer";

import EDocComponentPalette from './EDocComponentPalette';
import EDocEditorCanvas from './EDocEditorCanvas';
import EDocDesignerTopMenu from './EDocDesignerTopMenu'; // 상단 메뉴 컴포넌트 추가
import EDocPropertyEditor from './EDocPropertyEditor';  // 경로는 상황에 맞게 조정

/**
 * EDocDesignerContainer.js
 * EDoc 디자이너 컨테이너 컴포넌트
 * 문서 편집 및 컴포넌트 관리 기능을 포함
 */
export default function EDocDesignerContainer({ documentId }) {
  const { BrunnerMessageBox, openModal } = useModal();
  const [loading, setLoading] = useState(false);


  const [documentData, setDocumentData] = useState({
    id: documentId || null,
    title: 'new document',
    description: '신규 기록서',
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
    if (selectedComponentId === null || selectedComponentId < 0) return;
    newComponents[selectedComponentId] = updatedComponent;
    return { ...prev, components: newComponents };
  });
  }

  

   function handleAddComponent(component) {
  const baseComponent = { ...component };

  const tpl = component.template_json;
  console.log("template_json:", component.template_json);

  // 초기 runtime_data 자동 생성
  const defaultRuntimeData = {};
  switch (tpl.type) {
    case constants.edoc.COMPONENT_TYPE_TEXT:
      defaultRuntimeData.content = "여기에 텍스트를 입력하세요";
      defaultRuntimeData.textAlign = "left"; // 기본 정렬
      break;
    case constants.edoc.COMPONENT_TYPE_IMAGE:
      defaultRuntimeData.src = "";
      break;
    case constants.edoc.COMPONENT_TYPE_INPUT:
      defaultRuntimeData.placeholder = "값을 입력하세요";
      defaultRuntimeData.textAlign = "left"; // 기본 정렬
      break;
    case constants.edoc.COMPONENT_TYPE_TABLE:
      defaultRuntimeData.cols = 3;
      defaultRuntimeData.rows = 3;
      defaultRuntimeData.data = Array.from({ length: 3 }, () => Array(3).fill(""));
      defaultRuntimeData.columns = ["ColumnHeader1", "ColumnHeader2", "ColumnHeader3"];
      break;
    // 다른 타입에 대한 기본값 추가 가능
    default:
      break;
  }
  baseComponent.runtime_data = defaultRuntimeData;
  
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
        title: 'new document',
        description: '신규 기록서',
        components: [],
      });
    }
  };

  // 문서 열기 (예시: prompt로 문서 ID 입력받기)
  const handleOpenDocument = async () => {
    const id = window.prompt('열 문서 ID를 입력하세요');
    if (id) {
      try{
      const jRequest = {
        commandName: constants.commands.COMMAND_EDOC_DOCUMENT_SELECT_ONE,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
        documentId: id
      };
      var jResponse = null;

      setLoading(true); // 데이터 로딩 시작
      jResponse = await RequestServer("POST", jRequest);
      setLoading(false); // 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        setDocumentData(jResponse.documentData); // 상태에 저장

      } else openModal(jResponse.error_message);
    }
    catch(e){}
    }
  };

  // 문서 저장 (예시: POST or PUT 호출)
  const handleSaveDocument = async () => {

    const jRequest = {
      commandName: constants.commands.COMMAND_EDOC_DOCUMENT_UPSERT_ONE,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
      documentData: documentData
    };
    var jResponse = null;

    setLoading(true); // 데이터 로딩 시작
    jResponse = await RequestServer("POST", jRequest);
    setLoading(false); // 데이터 로딩 끝

    if (jResponse.error_code === 0) {
      openModal(constants.messages.MESSAGE_SUCCESS_SAVED);
      setDocumentData(jResponse.documentData);
    } else openModal(jResponse.error_message);
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
          <EDocDesignerTopMenu         
            onNewDocument={handleNewDocument}
            onOpenDocument={handleOpenDocument}
            onSaveDocument={handleSaveDocument}
            onExportPdf={handleExportPdf} 
            documentData={documentData} 
            setDocumentData={setDocumentData} />
          
          <h1 className="text-2xl font-bold mb-6">{documentData.title} : {documentData.id}</h1>
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