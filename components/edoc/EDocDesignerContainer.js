import { useState, useEffect } from 'react';
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import { useModal } from "@/components/brunnerMessageBox";
import RequestServer from "@/components/requestServer";

import EDocComponentPalette from './EDocComponentPalette';
import EDocEditorCanvas from './EDocEditorCanvas';
import EDocDesignerTopMenu from './EDocDesignerTopMenu';
import EDocPropertyEditor from './EDocPropertyEditor';
import EDocDocumentPropertyEditor from './EDocDocumentPropertyEditor';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

  const handleComponentChange = (updatedComponent) => {
    if (selectedComponentId === null) return;

    setDocumentData((prev) => {
      const newComponents = [...prev.components];
      newComponents[selectedComponentId] = updatedComponent;
      return { ...prev, components: newComponents };
    });
  };

  const handleAddComponent = (component) => {
    const baseComponent = { ...component };
    const tpl = component.template_json;
    const defaultRuntimeData = {
      width: '100%', // 기본 폭 지정
      height: '',
      forceNewLine: false
    };
    switch (tpl.type) {
      case constants.edoc.COMPONENT_TYPE_TEXT:
        defaultRuntimeData.content = "여기에 텍스트를 입력하세요";
        defaultRuntimeData.textAlign = "left";
        defaultRuntimeData.positionAlign = "left";
        break;
      case constants.edoc.COMPONENT_TYPE_IMAGE:
        defaultRuntimeData.src = "";
        defaultRuntimeData.positionAlign = "left";
        break;
      case constants.edoc.COMPONENT_TYPE_INPUT:
        defaultRuntimeData.placeholder = "값을 입력하세요";
        defaultRuntimeData.textAlign = "left";
        defaultRuntimeData.positionAlign = "left";
        break;
      case constants.edoc.COMPONENT_TYPE_TABLE:
        defaultRuntimeData.cols = 3;
        defaultRuntimeData.rows = 3;
        defaultRuntimeData.data = Array.from({ length: 3 }, () => Array(3).fill(""));
        defaultRuntimeData.columns = [
          { width: "33%", header: "ColumnHeader1" },
          { width: "200px", header: "ColumnHeader2" },
          { width: "auto", header: "ColumnHeader3" }
        ];
        defaultRuntimeData.positionAlign = "left";
        break;
      case constants.edoc.COMPONENT_TYPE_CHECKLIST:
        defaultRuntimeData.itemCount = 3;
        defaultRuntimeData.items = Array.from({ length: 3 }, (_, i) => ({ label: `항목 ${i + 1}`, checked: false}));
        defaultRuntimeData.positionAlign = "left";
        break;
      default:
        break;
    }
    baseComponent.runtime_data = defaultRuntimeData;

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
    const id = window.prompt('열 문서 ID를 입력하세요');
    if (id) openDocumentById(id);
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
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let position = 0;
    if (pdfHeight < pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    } else {
      while (position < pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight);
        position += pageHeight;
        if (position < pdfHeight) pdf.addPage();
      }
    }
    pdf.save(`${documentData.title || 'document'}_${documentData.id}.pdf`);
    setLoading(false);
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

  const handleUpdateComponent = (selectedComponentIdX, updatedComponent) => {
    setDocumentData((prev) => {
      const newComponents = [...prev.components];
      newComponents[selectedComponentIdX] = updatedComponent;
      return { ...prev, components: newComponents };
    });
  };

  const handleUpdateAllComponentAlign = (newAlign) => {
  setDocumentData(prev => {
    const updatedComponents = prev.components.map(comp => ({
      ...comp,
      runtime_data: {
        ...comp.runtime_data,
        positionAlign: newAlign
      }
    }));
    return {
      ...prev,
      components: updatedComponents
    };
  });
};

  return (
    <>
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
            <EDocPropertyEditor
              component={selectedComponent}
              onComponentChange={handleComponentChange}
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

                  // 컴포넌트 정렬도 업데이트
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
    </>
  );
}
