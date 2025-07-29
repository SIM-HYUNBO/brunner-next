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
import EDocPagePropertyEditor from './eDocPagePropertyEditor';
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
  const [mode, setMode] = useState("design");
  const [componentTemplates, setComponentTemplates] = useState([]);
  const [documentData, setDocumentData] = useState({
    id: documentId || null,
    runtime_data: {
      title: 'New Document',
      description: '신규 전자 문서',
      isPublic: false,
      backgroundColor: "#ffffff",
      padding: 1
    },
    pages: [{
      id: 'page-1',
      components: [],
      runtime_data: {
        padding: 24,
        alignment: "center",
        backgroundColor: "#ffffff",
        pageSize: "A4"
      }
    }],
  });

  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [documentList, setDocumentList] = useState([]);
  const [showDocumentListModal, setShowDocumentListModal] = useState(false);

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

  useEffect(() => {
    if (documentId) {
      openDocumentById(documentId);
    }
  }, [documentId]);

  const toggleMode = () => setMode(prev => (prev === "design" ? "runtime" : "design"));

  const handleNewDocument = () => {
    if (window.confirm('현재 작업 중인 문서가 저장되지 않을 수 있습니다. 새 문서를 생성하시겠습니까?')) {
      const title = window.prompt('새문서 이름을 입력하세요');
      setDocumentData({
        id: null,
        runtime_data: {
          title: title || 'New Document',
          description: '신규 기록서',
          backgroundColor: "#ffffff"
        },
        pages: [{
          id: 'page-1',
          components: [],
          runtime_data: {
            padding: 24,
            alignment: "center",
            backgroundColor: "#ffffff",
            pageSize: "A4"
          }
        }],
      });
      setCurrentPageIdx(0);
      setSelectedComponentId(null);
    }
  };

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
      setCurrentPageIdx(0);
      setSelectedComponentId(null);
    } else {
      openModal(jResponse.error_message);
    }
  };

  const handleSaveDocument = async () => {
    const jRequest = {
      commandName: constants.commands.EDOC_DOCUMENT_UPSERT_ONE,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
      documentData: documentData
    };
    setLoading(true);
    const jResponse = await RequestServer(jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      if (triggerLeftMenuReload) triggerLeftMenuReload();
      openModal(constants.messages.SUCCESS_SAVED);
      setDocumentData(jResponse.documentData);
      setCurrentPageIdx(0);
    } else {
      openModal(jResponse.error_message);
    }
  };

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
        pages: [{
          id: 'page-1',
          components: [],
          runtime_data: {
            padding: 24,
            alignment: "center",
            backgroundColor: "#ffffff",
            pageSize: "A4"
          }
        }],
        runtime_data: {
          id: null,
          title: 'New Document',
          description: '신규 기록서',
          backgroundColor: "#ffffff"
        }
      });
      setCurrentPageIdx(0);
      setSelectedComponentId(null);
    } else openModal(jResponse.error_message);
  };

  const handleAddPage = () => {
    const newPageId = `page-${documentData.pages.length + 1}`;
    const newPage = {
      id: newPageId,
      components: [],
      runtime_data: { pageSize: 'A4', padding: 24 }
    };

    setDocumentData(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
    setCurrentPageIdx(documentData.pages.length);
  };

  const handleDeleteCurrentPage = async () => {
    if (documentData.pages.length === 1) {
      openModal(constants.messages.MINIUM_PAGE_COUNT);
      return;
    }
    const confirm = await openModal(`The index ${currentPageIdx + 1}, ${constants.messages.DELETE_SELECTED_PAGE}`);
    if (!confirm) return;

    setDocumentData(prev => {
      const newPages = [...prev.pages];
      newPages.splice(currentPageIdx, 1);
      return {
        ...prev,
        pages: newPages
      };
    });
    setCurrentPageIdx(currentPageIdx > 0 ? currentPageIdx - 1 : 0);
  };

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
    setDocumentData(prev => {
      const newPages = [...prev.pages];
      newPages[currentPageIdx] = {
        ...newPages[currentPageIdx],
        components: [...newPages[currentPageIdx].components, baseComponent]
      };
      return { ...prev, pages: newPages };
    });
  };

  const handleComponentSelect = (idx) => setSelectedComponentId(idx);

  const handleUpdateComponent = (updatedComponent) => {
    if (selectedComponentId === null) return;
    setDocumentData(prev => {
      const newPages = [...prev.pages];
      const newComponents = [...newPages[currentPageIdx].components];
      newComponents[selectedComponentId] = updatedComponent;
      newPages[currentPageIdx].components = newComponents;
      return { ...prev, pages: newPages };
    });
  };

  const handleMoveComponentUp = () => {
    if (selectedComponentId === null || selectedComponentId <= 0) return;
    setDocumentData(prev => {
      const newPages = [...prev.pages];
      const components = [...newPages[currentPageIdx].components];
      [components[selectedComponentId - 1], components[selectedComponentId]] = [components[selectedComponentId], components[selectedComponentId - 1]];
      newPages[currentPageIdx].components = components;
      return { ...prev, pages: newPages };
    });
    setSelectedComponentId(prev => prev - 1);
  };

  const handleMoveComponentDown = () => {
    const comps = documentData.pages[currentPageIdx].components;
    if (selectedComponentId === null || selectedComponentId >= comps.length - 1) return;
    setDocumentData(prev => {
      const newPages = [...prev.pages];
      const components = [...newPages[currentPageIdx].components];
      [components[selectedComponentId + 1], components[selectedComponentId]] = [components[selectedComponentId], components[selectedComponentId + 1]];
      newPages[currentPageIdx].components = components;
      return { ...prev, pages: newPages };
    });
    setSelectedComponentId(prev => prev + 1);
  };

  const handleDeleteComponent = () => {
    if (selectedComponentId === null) return;
    setDocumentData(prev => {
      const newPages = [...prev.pages];
      const components = [...newPages[currentPageIdx].components];
      components.splice(selectedComponentId, 1);
      newPages[currentPageIdx].components = components;
      return { ...prev, pages: newPages };
    });
    setSelectedComponentId(null);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    const canvas = await html2canvas(document.querySelector('.edoc-designer-canvas'), { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${documentData.runtime_data.title || 'document'}.pdf`);

    setIsExportingPdf(false);
  };

  const handleDocumentListClick = (doc) => {
    setShowDocumentListModal(false);
    openDocumentById(doc.id);
  };

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
        totalPageCount={documentData.pages.length}
        setCurrentPageIdx={setCurrentPageIdx}
      />

      <div className="flex h-screen desktop:pr-20">
        {/* 왼쪽 컴포넌트 팔레트 */}
        <aside className="w-36 bg-white dark:bg-slate-700 border-r border-slate-300 dark:border-slate-500">
          <h2 className="font-bold mb-3 text-slate-800 dark:text-slate-100">컴포넌트 팔레트</h2>
          <EDocComponentPalette
            templates={componentTemplates}
            onAddComponent={handleAddComponent}
          />
        </aside>

        {/* 중앙 편집 캔버스 */}
        <div className="flex-1 overflow-auto">
          {documentData && (
            <h1 className="text-2xl font-bold mx-4 mb-4 text-slate-800 dark:text-slate-100">
              {documentData.runtime_data.title || ''} : {documentData.id}
            </h1>
          )}

          {/* 도큐먼트 객체 (디자인 타임) */}
          <main
            className="pt-16 flex-grow edoc-designer-canvas"
            style={{
              backgroundColor: documentData?.runtime_data?.backgroundColor || '#f8f8f8',
              padding: `${documentData.runtime_data.padding}px`, // 문서여백 1px 고정
            }}
          >
          {documentData.pages.map((page, idx) => (
            <div
              key={page.id}
              className={`relative w-fit mx-auto border border-dashed border-slate-400 dark:border-slate-500 ${
                idx === currentPageIdx ? 'outline outline-2 outline-blue-400' : ''
              }`}
              
              onClick={() => {
                setCurrentPageIdx(idx);
                setSelectedComponentId(null);
              }}
            >
              <div className="absolute top-2 left-2 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 text-xs rounded px-2 py-1 select-none pointer-events-none z-10">
                p{idx + 1}
              </div>

              <EDocEditorCanvas
                pageData={page}
                isSelected={idx === currentPageIdx}
                onSelect={() => {
                  setCurrentPageIdx(idx);
                  setSelectedComponentId(null);
                }}
                selectedComponentId={selectedComponentId}
                onComponentSelect={handleComponentSelect}
                onMoveUp={handleMoveComponentUp}
                onMoveDown={handleMoveComponentDown}
                onDeleteComponent={handleDeleteComponent}
                onUpdateComponent={handleUpdateComponent}
                isViewerMode={isExportingPdf}
                mode={mode}
                bindingData={commonFunctions.bindingData}
              />
            </div>
          ))}
          </main>
        </div>

        {/* 오른쪽 속성 편집창 */}
        <aside className="w-56 bg-white dark:bg-slate-700 border-0 border-slate-300 dark:border-slate-500 p-4 block">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">속성창</h2>

          {selectedComponentId !== null &&
          documentData.pages[currentPageIdx]?.components[selectedComponentId] ? (
            <EDocComponentPropertyEditor
              component={documentData.pages[currentPageIdx].components[selectedComponentId]}
              handleUpdateComponent={handleUpdateComponent}
            />
          ) : (
            <>
              <EDocDocumentPropertyEditor
                runtimeData={documentData.runtime_data}
                onChangeRuntimeData={(updatedRuntimeData) =>
                  setDocumentData((prev) => ({
                    ...prev,
                    runtime_data: updatedRuntimeData,
                  }))
                }
              />

              {/* ✅ 페이지 속성 편집기 추가 */}
              <EDocPagePropertyEditor
                runtimeData={documentData.pages[currentPageIdx]?.runtime_data || {}}
                onChangeRuntimeData={(updatedPageRuntimeData) =>
                  setDocumentData((prev) => {
                    const updatedPages = [...prev.pages];
                    updatedPages[currentPageIdx] = {
                      ...updatedPages[currentPageIdx],
                      runtime_data: updatedPageRuntimeData,
                    };
                    return { ...prev, pages: updatedPages };
                  })
                }
              />
            </>
          )}
        </aside>
      </div>

      {/* 문서 선택 모달 */}
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
                  {doc.runtime_data.title} ({doc.id})
                </li>
              ))}
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-slate-300 dark:bg-slate-600 rounded hover:bg-slate-400 dark:hover:bg-slate-500"
              onClick={() => setShowDocumentListModal(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 메시지 박스 */}
      <BrunnerMessageBox />
    </>
  );
}
