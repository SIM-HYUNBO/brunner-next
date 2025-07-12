`use strict`

import { useState, useEffect } from 'react';
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import { useModal } from "@/components/brunnerMessageBox";
import RequestServer from "@/components/requestServer";

import EDocComponentPalette from './EDocComponentPalette';
import EDocEditorCanvas from './EDocEditorCanvas';
import EDocDesignerTopMenu from './EDocDesignerTopMenu';
import EDocComponentPropertyEditor from './EDocComponentPropertyEditor';
import EDocDocumentPropertyEditor from './EDocDocumentPropertyEditor';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import * as InputComponent from "@/components/edoc/edocComponent/edocComponent_Input";
import * as TextComponent from "@/components/edoc/edocComponent/edocComponent_Text";
import * as ImageComponent from "@/components/edoc/edocComponent/edocComponent_Image";
import * as TableComponent from "@/components/edoc/edocComponent/edocComponent_Table";
import * as CheckListComponent from "@/components/edoc/edocComponent/edocComponent_CheckList";

export default function EDocDesignerContainer({ documentId }) {
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

  const [componentTemplates, setComponentTemplates] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const selectedComponent = selectedComponentId !== null ? documentData.components[selectedComponentId] : null;

const [documentList, setDocumentList] = useState([]);
const [showDocumentListModal, setShowDocumentListModal] = useState(false);

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

  const handleComponentSelect = (idx) => {
    setSelectedComponentId(idx);
  };

  const handleAddComponent = (component) => {
    const baseComponent = { ...component };
    var defaultRuntimeData = {
        width: 'auto', // 기본 폭 지정
        height: '',
        forceNewLine: true
      };

    switch (component.template_json.type) {
      case constants.edoc.COMPONENT_TYPE_TEXT:
        baseComponent.runtime_data = TextComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edoc.COMPONENT_TYPE_IMAGE:
        baseComponent.runtime_data = ImageComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edoc.COMPONENT_TYPE_INPUT:
        baseComponent.runtime_data = InputComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edoc.COMPONENT_TYPE_TABLE:
        baseComponent.runtime_data = TableComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edoc.COMPONENT_TYPE_CHECKLIST:
        baseComponent.runtime_data = CheckListComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      default:
        break;
    }

    setDocumentData((prev) => ({
      ...prev,
      components: [...prev.components, baseComponent],
    }));
  };

  const handleNewDocument = () => {
    if (window.confirm('현재 작업 중인 문서가 저장되지 않을 수 있습니다. 새 문서를 생성하시겠습니까?')) {
      const title = window.prompt('새문서 이름을 입력하세요');
      setDocumentData({
        id: null,
        title: title || 'new document',
        description: '신규 기록서',
        components: [],
        runtime_data: {
          padding: 24,
          alignment: "center",
          backgroundColor: "#ffffff",
          pageSize: "A4"
        }
      });
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
      documentId: id
    };
    setLoading(true);
    const jResponse = await RequestServer("POST", jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      setDocumentData(jResponse.documentData || {});
    } else openModal(jResponse.error_message);
  };

  const handleSaveDocument = async () => {
    const jRequest = {
      commandName: constants.commands.COMMAND_EDOC_DOCUMENT_UPSERT_ONE,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
      documentData: documentData
    };

    setLoading(true);
    const jResponse = await RequestServer("POST", jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      openModal(constants.messages.MESSAGE_SUCCESS_SAVED);
      setDocumentData(jResponse.documentData);
    } else openModal(jResponse.error_message);
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
  const element = document.getElementById("editor-canvas");
  if (!element) return alert("캔버스를 찾을 수 없습니다.");

  setLoading(true);
  await waitForImagesLoaded(element);

  try {
    // scale 낮추기 (예: 1.5 또는 1)
    const canvas = await html2canvas(element, { scale: 1.5, useCORS: false });

    // 캔버스 크기 체크 (필요시 축소)
    if (canvas.width > 5000 || canvas.height > 5000) {
      console.warn("캔버스 크기 너무 큼:", canvas.width, canvas.height);
      // 필요하면 여기서 canvas 크기 줄이기 구현 가능
    }

    // PNG 대신 JPEG 사용해보기 (용량과 호환성 향상)
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const pxToMm = (px) => (px * 25.4) / 96;

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

      if (renderedHeight > 0) pdf.addPage();
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, renderHeight);

      renderedHeight += renderHeight;
    }

    pdf.save(`${documentData.title || 'document'}_${documentData.id}.pdf`);
  } catch (error) {
    console.error("PDF 변환 중 오류 발생:", error);
    alert("PDF 변환 중 오류가 발생했습니다.");
  } finally {
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
    setDocumentData(prev => {
      const components = [...prev.components];
      [components[selectedComponentId - 1], components[selectedComponentId]] = [components[selectedComponentId], components[selectedComponentId - 1]];
      return { ...prev, components };
    });
    setSelectedComponentId(prev => prev - 1);
  }

  const handleMoveComponentDown = () => {
    if (selectedComponentId === null || selectedComponentId >= documentData.components.length - 1) return;
    setDocumentData(prev => {
      const components = [...prev.components];
      [components[selectedComponentId + 1], components[selectedComponentId]] = [components[selectedComponentId], components[selectedComponentId + 1]];
      return { ...prev, components };
    });
    setSelectedComponentId(prev => prev + 1);
  }

  const handleDeleteComponent = () => {
    if (selectedComponentId === null) return;
    setDocumentData((prev) => {
      const components = [...prev.components];
      components.splice(selectedComponentId, 1);
      return { ...prev, components };
    });
    setSelectedComponentId(null);
  }

  const handleUpdateComponent = (updatedComponent) => {
    if (selectedComponentId === null) return;

    setDocumentData((prev) => {
      const newComponents = [...prev.components];
      newComponents[selectedComponentId] = updatedComponent;
      return { ...prev, components: newComponents };
    });
  };

  const bindingData = () => {
    if (!Array.isArray(documentData.components)) return {};

    return documentData.components.reduce((acc, comp) => {
      const bindingKey = comp.runtime_data?.bindingKey;
      if (bindingKey) {
        acc[bindingKey] = comp.runtime_data;
      }
      return acc;
    }, {});
  }

  var tableData = bindingData().V_Table;
  var checkListData = bindingData().V_CheckList;   
  console.log(checkListData);

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
            onDeleteDocument={handleDeleteDocument}
            onExportPdf={handleExportPdf}
            documentData={documentData}
            setDocumentData={setDocumentData}
          />
          {documentData && (
            <h1 className="text-2xl font-bold mb-6">
              {documentData.title || ''} : {documentData.id}
            </h1>
          )}
          <EDocEditorCanvas
            components={documentData.components}
            selectedComponentId={selectedComponentId}
            onComponentSelect={handleComponentSelect}
            onMoveUp= {handleMoveComponentUp}
            onMoveDown={handleMoveComponentDown}
            onDeleteComponent={handleDeleteComponent}
            onUpdateComponent={handleUpdateComponent}
            documentRuntimeData={documentData.runtime_data}
          />
        </main>

        <aside className="w-80 bg-white border-l border-gray-300 p-4 hidden md:block">
          <h2 className="text-lg font-semibold mb-4">속성창</h2>
          {selectedComponent ? (
            <EDocComponentPropertyEditor
              component={selectedComponent}
              handleUpdateComponent={handleUpdateComponent}
            />
          ) : (
            <EDocDocumentPropertyEditor
              runtimeData={documentData.runtime_data || {}}
              onChange={(updatedRuntimeData) => {
                setDocumentData(prev => {
                  // 정렬이 변경되었는지 확인
                  const prevAlign = prev.runtime_data?.positionAlign;
                  const newAlign = updatedRuntimeData.positionAlign;
                  const needUpdateAlign = prevAlign !== newAlign;

                  // 모든 컴포넌트 정렬도 업데이트
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
  );
}
