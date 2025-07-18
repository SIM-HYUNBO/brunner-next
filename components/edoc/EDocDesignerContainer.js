`use strict`

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

import * as InputComponent from "@/components/eDoc/edocComponent/edocComponent_Input";
import * as TextComponent from "@/components/eDoc/edocComponent/edocComponent_Text";
import * as ImageComponent from "@/components/eDoc/edocComponent/edocComponent_Image";
import * as TableComponent from "@/components/eDoc/edocComponent/edocComponent_Table";
import * as CheckListComponent from "@/components/eDoc/edocComponent/edocComponent_CheckList";
import * as ButtonComponent from "@/components/eDoc/edocComponent/edocComponent_Button";
import * as VideoComponent from "@/components/eDoc/edocComponent/edocComponent_Video";

export default function EDocDesignerContainer({ documentId, triggerLeftMenuReload }) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [mode, setMode] = useState("design"); // "design" or "runtime"
    const toggleMode = () => {
    setMode((prev) => (prev === "design" ? "runtime" : "design"));
  };

  useEffect(() => {
    async function fetchTemplates() {
      const jRequest = {
        commandName: constants.commands.COMMAND_EDOC_COMPONENT_TEMPLATES_SELECT_ALL,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo?.userId,
      };
      setLoading(true);
      const jResponse = await RequestServer("POST", jRequest);
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


  const { BrunnerMessageBox, openModal } = useModal();
  const [loading, setLoading] = useState(false);

  const [documentData, setDocumentData] = useState({
    id: documentId || null,
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
  
  const [pages, setPages] = useState([
    {
      id: 'page-1',
      components: [],
      runtime_data: {
        pageSize: 'A4',
        padding: 24,
      }
    }
  ]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  const [componentTemplates, setComponentTemplates] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  
  const [documentList, setDocumentList] = useState([]);
  const [showDocumentListModal, setShowDocumentListModal] = useState(false);

  const handleAddPage = () => {
    setPages((prevPages) => {
      const newPageId = `page-${prevPages.length + 1}`;
      const newPage = {
        id: newPageId,
        components: [],
        runtime_data: { pageSize: 'A4', padding: 24 }
      };
      return [...prevPages, newPage];
    });
    setCurrentPageIdx(pages.length); // 새 페이지로 이동
  };

  const handleDeleteCurrentPage = async () => {
    if (pages.length === 1) {
      openModal(constants.messages.MESSAGE_MINIUM_PAGE_COUNT);
          return;
    }

    const confirm =await openModal(`The index ${currentPageIdx + 1}, ${constants.messages.MESSAGE_DELETE_SELECTED_PAGE}`);
      if (!confirm) 
        return;

    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages.splice(currentPageIdx, 1);

      // 현재 페이지 idx 보정: 삭제 후 0으로 가거나 이전 페이지로 가기
      const newCurrent = currentPageIdx > 0 ? currentPageIdx - 1 : 0;
      setCurrentPageIdx(newCurrent);

      return newPages;
    });
  };

  const updatePageComponent = (pageIdx, componentIdx, updated) => {
    const newPages = [...pages];
    newPages[pageIdx].components[componentIdx] = updated;
    setPages(newPages);
  };

  const handleComponentSelect = (idx) => {
    setSelectedComponentId(idx);
  };

  const handleAddComponent = (component) => {
    const baseComponent = { ...component };
    var defaultRuntimeData = {
      width: 'auto', // 기본 폭 지정
      height: '',
      forceNewLine: true,
    };

    switch (component.template_json.type) {
      case constants.edoc.EDOC_COMPONENT_TYPE_TEXT:
        baseComponent.runtime_data = TextComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edoc.EDOC_COMPONENT_TYPE_IMAGE:
        baseComponent.runtime_data = ImageComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edoc.EDOC_COMPONENT_TYPE_INPUT:
        baseComponent.runtime_data = InputComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edoc.EDOC_COMPONENT_TYPE_TABLE:
        baseComponent.runtime_data = TableComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edoc.EDOC_COMPONENT_TYPE_CHECKLIST:
        baseComponent.runtime_data = CheckListComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edoc.EDOC_COMPONENT_TYPE_BUTTON:
        baseComponent.runtime_data = ButtonComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edoc.EDOC_COMPONENT_TYPE_VIDEO:
        baseComponent.runtime_data = VideoComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      default:
        break;
    }

    setPages((prevPages) => {
      const newPages = [...prevPages];
      // 현재 페이지 idx가 전역으로 관리되어야 하며, 여기선 currentPageIdx를 참조한다고 가정
      newPages[currentPageIdx].components = [
        ...newPages[currentPageIdx].components,
        baseComponent,
      ];
      return newPages;
    });
  };

  const handleNewDocument = () => {
    if (window.confirm('현재 작업 중인 문서가 저장되지 않을 수 있습니다. 새 문서를 생성하시겠습니까?')) {
      const title = window.prompt('새문서 이름을 입력하세요');

      setDocumentData({
        id: null,
        title: title || 'new document',
        description: '신규 기록서',
        runtime_data: {
          padding: 24,
          alignment: "center",
          backgroundColor: "#ffffff",
          pageSize: "A4"
        }
      });

      // 📌 실제 렌더링 상태 pages도 초기화!
      setPages([
        {
          id: 'page-1',
          components: [],
          runtime_data: {
            pageSize: 'A4',
            padding: 24,
          },
        },
      ]);

      // 📌 현재 페이지 인덱스도 초기화!
      setCurrentPageIdx(0);

      // 선택된 컴포넌트도 초기화!
      setSelectedComponentId(null);
    }
  };

  const handleOpenDocument = async () => {
    const jRequest = {
      commandName: constants.commands.COMMAND_EDOC_DOCUMENT_SELECT_ALL,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
    };

    setLoading(true);
    const jResponse = await RequestServer("POST", jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      setDocumentList(jResponse.documentList);
      setShowDocumentListModal(true);
    } else openModal(jResponse.error_message);
  };

const openDocumentById = async (id) => {
  const jRequest = {
    commandName: constants.commands.COMMAND_EDOC_DOCUMENT_SELECT_ONE,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userInfo.getLoginUserId(),
    documentId: id,
  };

  setLoading(true);
  const jResponse = await RequestServer("POST", jRequest);
  setLoading(false);

  if (jResponse.error_code === 0) {
    const loadedDocument = jResponse.documentData || {};

    setDocumentData(loadedDocument);

    // ✅ DB에서 불러온 pages를 그대로 사용
    if (Array.isArray(loadedDocument.pages) && loadedDocument.pages.length > 0) {
      setPages(loadedDocument.pages);
    } else {
      // fallback: pages가 없으면 components로 한 페이지 만들어줌
      setPages([
        {
          id: 'page-1',
          components: loadedDocument.components || [],
          runtime_data: {
            pageSize: loadedDocument.runtime_data?.pageSize || 'A4',
            padding: loadedDocument.runtime_data?.padding || 24,
          },
        },
      ]);
    }

    setCurrentPageIdx(0);
    setSelectedComponentId(null);
  } else {
    openModal(jResponse.error_message);
  }
};


const handleSaveDocument = async () => {
  const jRequest = {
    commandName: constants.commands.COMMAND_EDOC_DOCUMENT_UPSERT_ONE,
    systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
    userId: userInfo.getLoginUserId(),
    documentData: {
      ...documentData,
      pages, // 전체 pages 배열을 통째로 보내기
    },
  };

  setLoading(true);
  const jResponse = await RequestServer("POST", jRequest);
  setLoading(false);

  if (jResponse.error_code === 0) {
    if (triggerLeftMenuReload) {
       triggerLeftMenuReload(); // ✅ LeftMenu 새로고침 트리거
    }

    openModal(constants.messages.MESSAGE_SUCCESS_SAVED);
    setDocumentData(jResponse.documentData);

    // 서버에서 받은 pages 배열로 복원
    setPages(jResponse.documentData.pages || [
      {
        id: 'page-1',
        components: jResponse.documentData.components || [],
        runtime_data: {
          pageSize: jResponse.documentData.runtime_data?.pageSize || 'A4',
          padding: jResponse.documentData.runtime_data?.padding || 24,
        },
      }
    ]);
    setCurrentPageIdx(0);
  } else {
    openModal(jResponse.error_message);
  }
};

  const handleDeleteDocument = async () => {
    const result = await openModal(constants.messages.MESSAGE_DELETE_ITEM);
    if (!result) 
      return;

    const jRequest = {
      commandName: constants.commands.COMMAND_EDOC_DOCUMENT_DELETE_ONE,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
      documentId: documentData.id
    };

    setLoading(true);
    const jResponse = await RequestServer("POST", jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      if (triggerLeftMenuReload) {
        triggerLeftMenuReload(); // ✅ LeftMenu 새로고침 트리거
      }
    
      openModal(constants.messages.MESSAGE_SUCCESS_DELETED);
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
    } else openModal(jResponse.error_message);
  };

  const handleExportPdf = async () => {
    setLoading(true);
    setIsExportingPdf(true);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pxToMm = (px) => (px * 25.4) / 96;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    try {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const element = document.getElementById(`editor-canvas-${page.id}`);
        if (!element) {
          console.warn(`페이지 ${i + 1} 캔버스를 찾을 수 없습니다.`);
          continue;
        }

        await waitForImagesLoaded(element);

        const canvas = await html2canvas(element, { scale: 1.5, useCORS: false });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const pdfWidth = pageWidth;
        const scale = pdfWidth / pxToMm(canvasWidth);
        const pdfHeight = pxToMm(canvasHeight) * scale;

        let renderedHeight = 0;

        while (renderedHeight < pdfHeight) {
          const remainingHeight = pdfHeight - renderedHeight;
          const renderHeight = Math.min(pageHeight, remainingHeight);
          const sourceHeightPx = Math.floor((renderHeight / scale) * (96 / 25.4));

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvasWidth;
          pageCanvas.height = sourceHeightPx;

          const ctx = pageCanvas.getContext('2d');
          ctx.drawImage(
            canvas,
            0,
            Math.floor(renderedHeight / scale * (96 / 25.4)),
            canvasWidth,
            sourceHeightPx,
            0,
            0,
            canvasWidth,
            sourceHeightPx
          );

          const pageImgData = pageCanvas.toDataURL('image/jpeg', 1.0);

          if (i > 0 || renderedHeight > 0) pdf.addPage();
          pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, renderHeight);

          renderedHeight += renderHeight;
        }
      }

      pdf.save(`${documentData.title || 'document'}_${documentData.id}.pdf`);
    } catch (error) {
      console.error("PDF 변환 오류:", error);
      alert("PDF 변환 중 오류가 발생했습니다.");
    } finally {
      setIsExportingPdf(false);
      setLoading(false);
    }
  };

  const waitForImagesLoaded = async (container) => {
    const imgs = container.querySelectorAll("img");
    await Promise.all(
      Array.from(imgs).map((img) => {
        if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );
  };

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
}

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

const handleUpdateComponent = (updatedComponent) => {
  if (selectedComponentId === null) return;

  setPages(prevPages => {
    const newPages = [...prevPages];
    newPages[currentPageIdx].components[selectedComponentId] = updatedComponent;
    return newPages;
  });
};

function EDocDocumentListModal({ documents, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-180 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">문서 목록</h2>
        <ul>
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="p-2 border-b hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelect(doc.id)}
            >
              📄 {doc.title} ({doc.id})
            </li>
          ))}
        </ul>
        <button
          className="mt-4 px-4 py-2 bg-gray-300 rounded"
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

  return (
  <>
    <BrunnerMessageBox />
    {loading && (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )}

    <div className="flex h-screen bg-gray-100">
      <aside className="w-60 bg-white border-r border-gray-300 p-4 overflow-y-auto">
        <button className="text-lg font-semibold mb-4" onClick={toggleMode}>
          {mode === "design" ? "To Runtime Mode" : "To Design Mode"}
        </button>        
        <h2 className="text-lg font-semibold mb-4">컴포넌트 템플릿</h2>
        <EDocComponentPalette
          templates={componentTemplates}
          onAddComponent={handleAddComponent}
        />
      </aside>

      <main className="flex-1 flex flex-col p-0 overflow-auto">
        <div className="sticky top-0 z-50 bg-white shadow mb-4">
          <EDocDesignerTopMenu
            onNewDocument={handleNewDocument}
            onOpenDocument={handleOpenDocument}
            onSaveDocument={handleSaveDocument}
            onDeleteDocument={handleDeleteDocument}
            onAddPage={handleAddPage}
            onDeleteCurrentPage={handleDeleteCurrentPage}
            onExportPdf={handleExportPdf}
            documentData={documentData}
            setDocumentData={setDocumentData}
          />
        </div>

        {documentData && (
          <h1 className="text-2xl font-bold mb-6">
            {documentData.title || ''} : {documentData.id}
          </h1>
        )}

        <div className="flex-1 overflow-auto">
          {pages.map((page, idx) => (
            <div
              key={page.id}
              className="relative w-fit mx-auto border border-dashed border-gray-400" // ✅ 점선 경계 추가
              style={{ boxSizing: "border-box" }}
            >
              <div
                className="absolute top-2 left-2 bg-gray-200 text-gray-600 text-xs rounded z-10 select-none text-center px-2 py-1"
                style={{ pointerEvents: "none" }}
              >
                p{idx + 1}
              </div>
              <EDocEditorCanvas
                key={page.id}
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
        </div>
      </main>

      <aside 
      className="w-80 h-full bg-white border-l border-gray-300 p-4 hidden md:block overflow-y-auto"
      >
        <h2 className="text-lg font-semibold mb-4">속성창</h2>
        {pages[currentPageIdx].components[selectedComponentId] ? (
          <EDocComponentPropertyEditor
            component={pages[currentPageIdx].components[selectedComponentId]}
            handleUpdateComponent={handleUpdateComponent}
          />
        ) : (
          <EDocDocumentPropertyEditor
            title={documentData.title || ''}
            runtimeData={documentData.runtime_data || {}}
            onChangeTitle={(newTitle) => {
              setDocumentData(prev => ({  ...prev, title: newTitle }));
            }} 
            onChange={(updatedRuntimeData) => {
              setDocumentData(prev => {
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

    {showDocumentListModal && (
      <EDocDocumentListModal
        documents={documentList}
        onSelect={(id) => {
          openDocumentById(id);
          setShowDocumentListModal(false);
        }}
        onClose={() => setShowDocumentListModal(false)}
      />
    )}
  </>
)}
