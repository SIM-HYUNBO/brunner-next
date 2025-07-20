'use strict';

import { useState, useEffect } from 'react';
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import { useModal } from "@/components/brunnerMessageBox";
import RequestServer from "@/components/requestServer";

import EDocComponentPalette from './eDocComponentPalette';
import EDocEditorCanvas from './eDocEditorCanvas';
import EDocDesignerTopMenu from './eDocDesignerTopMenu';
import EDocComponentPropertyEditor from './eDocComponentPropertyEditor';
import EDocDocumentPropertyEditor from './eDocDocumentPropertyEditor';
import * as commonFunctions from '@/components/commonFunctions';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import * as InputComponent from "@/components/eDoc/eDocComponent/eDocComponent_Input";
import * as TextComponent from "@/components/eDoc/eDocComponent/eDocComponent_Text";
import * as ImageComponent from "@/components/eDoc/eDocComponent/eDocComponent_Image";
import * as TableComponent from "@/components/eDoc/eDocComponent/eDocComponent_Table";
import * as CheckListComponent from "@/components/eDoc/eDocComponent/eDocComponent_CheckList";
import * as ButtonComponent from "@/components/eDoc/eDocComponent/eDocComponent_Button";
import * as VideoComponent from "@/components/eDoc/eDocComponent/eDocComponent_Video";

export default function EDocDesignerContainer({ documentId, triggerLeftMenuReload }) {
  const { BrunnerMessageBox, openModal } = useModal();

  const [loading, setLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [mode, setMode] = useState("design"); // design or runtime
  const [componentTemplates, setComponentTemplates] = useState([]);
  const [documentData, setDocumentData] = useState({
    id: documentId || null,
    title: 'new document',
    description: '신규 전자 문서',
    isPublic: false,
    components: [],
    runtime_data: {
      padding: 24,
      alignment: "center",
      backgroundColor: "#ffffff",
      pageSize: "A4"
    }
  });
  const [pages, setPages] = useState([
    {
      id: 'page-1',
      components: [],
      runtime_data: { pageSize: 'A4', padding: 24 }
    }
  ]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [selectedComponentId, setSelectedComponentId] = useState(null);

  const [documentList, setDocumentList] = useState([]);
  const [showDocumentListModal, setShowDocumentListModal] = useState(false);

  // 로딩시 컴포넌트 템플릿 불러오기
  useEffect(() => {
    async function fetchTemplates() {
      const jRequest = {
        commandName: constants.commands.EDOC_COMPONENT_TEMPLATES_SELECT_ALL,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
      };
      setLoading(true);
      const jResponse = await RequestServer(jRequest);
      setLoading(false);

      if (jResponse.error_code === 0) {
        setComponentTemplates(jResponse.templateList);
      } else openModal(jResponse.error_message);
    }
    fetchTemplates();
  }, []);

  // documentId가 바뀌면 문서 열기
  useEffect(() => {
    if (documentId) {
      openDocumentById(documentId);
    }
  }, [documentId]);

  // 모드 토글
  const toggleMode = () => setMode(prev => (prev === "design" ? "runtime" : "design"));

  // 새 문서 생성
  const handleNewDocument = () => {
    if (window.confirm('현재 작업 중인 문서가 저장되지 않을 수 있습니다. 새 문서를 생성하시겠습니까?')) {
      const title = window.prompt('새문서 이름을 입력하세요');
      setDocumentData({
        id: null,
        title: title || 'new document',
        description: '신규 기록서',
        components: [],
        runtime_data: { padding: 24, alignment: "center", backgroundColor: "#ffffff", pageSize: "A4" }
      });
      setPages([{ id: 'page-1', components: [], runtime_data: { pageSize: 'A4', padding: 24 } }]);
      setCurrentPageIdx(0);
      setSelectedComponentId(null);
    }
  };

  // 문서 열기 - 사용자 문서 목록 조회 후 모달 띄우기
  const handleOpenDocument = async () => {
    const jRequest = {
      commandName: constants.commands.EDOC_USER_DOCUMENT_SELECT_ALL,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
    };
    setLoading(true);
    const jResponse = await RequestServer(jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      setDocumentList(jResponse.documentList);
      setShowDocumentListModal(true);
    } else openModal(jResponse.error_message);
  };

  // 문서 ID로 열기
  const openDocumentById = async (id) => {
    const jRequest = {
      commandName: constants.commands.EDOC_DOCUMENT_SELECT_ONE,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
      documentId: id,
    };
    setLoading(true);
    const jResponse = await RequestServer(jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      const loadedDocument = jResponse.documentData || {};
      setDocumentData(loadedDocument);

      if (Array.isArray(loadedDocument.pages) && loadedDocument.pages.length > 0) {
        setPages(loadedDocument.pages);
      } else {
        setPages([{
          id: 'page-1',
          components: loadedDocument.components || [],
          runtime_data: {
            pageSize: loadedDocument.runtime_data?.pageSize || 'A4',
            padding: loadedDocument.runtime_data?.padding || 24,
          },
        }]);
      }

      setCurrentPageIdx(0);
      setSelectedComponentId(null);
    } else {
      openModal(jResponse.error_message);
    }
  };

  // 문서 저장
  const handleSaveDocument = async () => {
    const jRequest = {
      commandName: constants.commands.EDOC_DOCUMENT_UPSERT_ONE,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
      documentData: {
        ...documentData,
        pages,
      },
    };
    setLoading(true);
    const jResponse = await RequestServer(jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      if (triggerLeftMenuReload) triggerLeftMenuReload();
      openModal(constants.messages.SUCCESS_SAVED);
      setDocumentData(jResponse.documentData);
      setPages(jResponse.documentData.pages || [{
        id: 'page-1',
        components: jResponse.documentData.components || [],
        runtime_data: {
          pageSize: jResponse.documentData.runtime_data?.pageSize || 'A4',
          padding: jResponse.documentData.runtime_data?.padding || 24,
        }
      }]);
      setCurrentPageIdx(0);
    } else {
      openModal(jResponse.error_message);
    }
  };

  // 문서 삭제
  const handleDeleteDocument = async () => {
    const result = await openModal(constants.messages.DELETE_ITEM);
    if (!result) return;

    const jRequest = {
      commandName: constants.commands.EDOC_DOCUMENT_DELETE_ONE,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
      documentId: documentData.id
    };
    setLoading(true);
    const jResponse = await RequestServer(jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      if (triggerLeftMenuReload) triggerLeftMenuReload();
      openModal(constants.messages.SUCCESS_DELETED);
      setDocumentData({
        id: null,
        title: 'new document',
        description: '신규 기록서',
        components: [],
        runtime_data: {
          padding: 24,
          alignment: "center",
          backgroundColor: "#ffffff",
          pageSize: "A4"
        }
      });
      setPages([{ id: 'page-1', components: [], runtime_data: { pageSize: 'A4', padding: 24 } }]);
      setCurrentPageIdx(0);
      setSelectedComponentId(null);
    } else openModal(jResponse.error_message);
  };

  // 페이지 추가
  const handleAddPage = () => {
    setPages(prevPages => {
      const newPageId = `page-${prevPages.length + 1}`;
      return [
        ...prevPages,
        { id: newPageId, components: [], runtime_data: { pageSize: 'A4', padding: 24 } }
      ];
    });
    setCurrentPageIdx(pages.length);
  };

  // 현재 페이지 삭제
  const handleDeleteCurrentPage = async () => {
    if (pages.length === 1) {
      openModal(constants.messages.MINIUM_PAGE_COUNT);
      return;
    }
    const confirm = await openModal(`The index ${currentPageIdx + 1}, ${constants.messages.DELETE_SELECTED_PAGE}`);
    if (!confirm) return;

    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages.splice(currentPageIdx, 1);
      const newCurrent = currentPageIdx > 0 ? currentPageIdx - 1 : 0;
      setCurrentPageIdx(newCurrent);
      return newPages;
    });
  };

  // 컴포넌트 추가
  const handleAddComponent = (component) => {
    const baseComponent = { ...component };
    const defaultRuntimeData = {
      width: 'auto',
      height: '',
      forceNewLine: true,
    };
    switch (component.template_json.type) {
      case constants.edocComponentType._TEXT:
        baseComponent.runtime_data = TextComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._IMAGE:
        baseComponent.runtime_data = ImageComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._INPUT:
        baseComponent.runtime_data = InputComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._TABLE:
        baseComponent.runtime_data = TableComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._CHECKLIST:
        baseComponent.runtime_data = CheckListComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._BUTTON:
        baseComponent.runtime_data = ButtonComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._VIDEO:
        baseComponent.runtime_data = VideoComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      default:
        break;
    }
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPageIdx].components = [...newPages[currentPageIdx].components, baseComponent];
      return newPages;
    });
  };

  // 컴포넌트 선택
  const handleComponentSelect = (idx) => setSelectedComponentId(idx);

  // 컴포넌트 업데이트
  const handleUpdateComponent = (updatedComponent) => {
    if (selectedComponentId === null) return;
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages[currentPageIdx].components[selectedComponentId] = updatedComponent;
      return newPages;
    });
  };

  // 컴포넌트 이동 (위)
  const handleMoveComponentUp = () => {
    if (selectedComponentId === null || selectedComponentId <= 0) return;
    setPages(prevPages => {
      const newPages = [...prevPages];
      const comps = [...newPages[currentPageIdx].components];
      [comps[selectedComponentId - 1], comps[selectedComponentId]] = [comps[selectedComponentId], comps[selectedComponentId - 1]];
      newPages[currentPageIdx].components = comps;
      return newPages;
    });
    setSelectedComponentId(prev => prev - 1);
  };

  // 컴포넌트 이동 (아래)
  const handleMoveComponentDown = () => {
    const comps = pages[currentPageIdx].components;
    if (selectedComponentId === null || selectedComponentId >= comps.length - 1) return;
    setPages(prevPages => {
      const newPages = [...prevPages];
      const comps = [...newPages[currentPageIdx].components];
      [comps[selectedComponentId + 1], comps[selectedComponentId]] = [comps[selectedComponentId], comps[selectedComponentId + 1]];
      newPages[currentPageIdx].components = comps;
      return newPages;
    });
    setSelectedComponentId(prev => prev + 1);
  };

  // 컴포넌트 삭제
  const handleDeleteComponent = () => {
    if (selectedComponentId === null) return;
    setPages(prevPages => {
      const newPages = [...prevPages];
      const comps = [...newPages[currentPageIdx].components];
      comps.splice(selectedComponentId, 1);
      newPages[currentPageIdx].components = comps;
      return newPages;
    });
    setSelectedComponentId(null);
  };

  // PDF 내보내기
  const handleExportPdf = async () => {
    setIsExportingPdf(true);

    const canvas = await html2canvas(document.querySelector('.edoc-designer-canvas'), {
      scale: 2,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${documentData.title || 'document'}.pdf`);

    setIsExportingPdf(false);
  };

  // 문서 리스트 모달에서 선택시 문서 열기
  const handleDocumentListClick = (doc) => {
    setShowDocumentListModal(false);
    openDocumentById(doc.id);
  };

  // 레이아웃 JSX
return (
  <>
    {loading && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 text-white text-xl font-bold">
        Loading...
      </div>
    )}

    {/* 상단 메뉴 */}
    <EDocDesignerTopMenu
      mode={mode}
      toggleMode={toggleMode}
      onNewDocument={handleNewDocument}
      onOpenDocument={handleOpenDocument}
      onSaveDocument={handleSaveDocument}
      onDeleteDocument={handleDeleteDocument}
      onAddPage={handleAddPage}
      onDeleteCurrentPage={handleDeleteCurrentPage}
      onExportPdf={handleExportPdf}
      currentPageIdx={currentPageIdx}
      totalPageCount={pages.length}
      setCurrentPageIdx={setCurrentPageIdx}
    />

    <div className="flex h-screen p-0">
      {/* 왼쪽 팔레트 */}
      <aside className="w-40 bg-white dark:bg-slate-700 border-r border-slate-300 dark:border-slate-500 p-4 mr-4">
        <h2 className="font-bold mb-3 text-slate-800 dark:text-slate-100">컴포넌트 팔레트</h2>
        <EDocComponentPalette
          templates={componentTemplates}
          onAddComponent={handleAddComponent}
        />
      </aside>

      {/* 가운데 편집영역 + 오른쪽 속성창 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 캔버스를 스크롤 가능한 래퍼로 감쌈 */}
        <div className="flex-1 overflow-auto">
          <main className="min-w-[800px] p-4 bg-white dark:bg-slate-900 mx-auto">
          {documentData && (
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
              {documentData.title || ''} : {documentData.id}
            </h1>
          )}

          {pages.map((page, idx) => (
            <div
              key={page.id}
              className={`relative w-fit mx-auto border border-dashed border-slate-400 dark:border-slate-500 mb-8 ${
                idx === currentPageIdx ? 'outline outline-2 outline-blue-400' : ''
              }`}
              style={{ boxSizing: 'border-box' }}
              onClick={() => { setCurrentPageIdx(idx); setSelectedComponentId(null); }}
            >
              <div
                className="absolute top-2 left-2 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-xs rounded px-2 py-1 select-none pointer-events-none z-10"
              >
                p{idx + 1}
              </div>

              <EDocEditorCanvas
                page={page}
                isSelected={idx === currentPageIdx}
                onSelect={() => { setCurrentPageIdx(idx); setSelectedComponentId(null); }}
                selectedComponentId={selectedComponentId}
                onComponentSelect={handleComponentSelect}
                onMoveUp={handleMoveComponentUp}
                onMoveDown={handleMoveComponentDown}
                onDeleteComponent={handleDeleteComponent}
                onUpdateComponent={handleUpdateComponent}
                isViewerMode={isExportingPdf}
                mode={mode}
                bindingData={commonFunctions.bindingData}
                documentData={documentData}
              />
            </div>
          ))}
        </main>
      </div>
      </div>
      {/* 오른쪽 속성창 */}
      <aside className="w-60 bg-white dark:bg-slate-700 border-0 border-slate-300 dark:border-slate-500 p-4 block">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">속성창</h2>
        {selectedComponentId !== null && pages[currentPageIdx]?.components[selectedComponentId] ? (
          <EDocComponentPropertyEditor
            component={pages[currentPageIdx].components[selectedComponentId]}
            handleUpdateComponent={handleUpdateComponent}
          />
        ) : (
          <EDocDocumentPropertyEditor
            title={documentData.title || ''}
            runtimeData={documentData.runtime_data || {}}
            onChangeTitle={(newTitle) => {
              setDocumentData((prev) => ({ ...prev, title: newTitle }));
            }}
            onChangeRuntimeData={(updatedRuntimeData) => {
              setDocumentData((prev) => {
                const prevAlign = prev.runtime_data?.positionAlign;
                const newAlign = updatedRuntimeData.positionAlign;
                const needUpdateAlign = prevAlign !== newAlign;

                const updatedComponents = needUpdateAlign
                  ? prev.components.map((comp) => ({
                      ...comp,
                      runtime_data: {
                        ...comp.runtime_data,
                        positionAlign: newAlign,
                      },
                    }))
                  : prev.components;

                return {
                  ...prev,
                  runtime_data: updatedRuntimeData,
                  components: updatedComponents,
                };
              });
            }}
          />
        )}
      </aside>
    </div>

    {/* 문서 목록 모달 */}
    {showDocumentListModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded shadow-lg w-96 max-h-96 overflow-auto p-4">
          <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">문서 선택</h3>
          <ul>
            {documentList.map((doc) => (
              <li
                key={doc.id}
                className="cursor-pointer py-2 px-3 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                onClick={() => handleDocumentListClick(doc)}
              >
                {doc.title} ({doc.id})
              </li>
            ))}
          </ul>
          <button
            className="px-4 py-2 bg-slate-300 dark:bg-slate-600 rounded hover:bg-slate-400 dark:hover:bg-slate-500"
            onClick={() => setShowDocumentListModal(false)}
          >
            닫기
          </button>
        </div>
      </div>
    )}

    {/* 메시지 박스 렌더링 */}
    <BrunnerMessageBox />
  </>
);
}
