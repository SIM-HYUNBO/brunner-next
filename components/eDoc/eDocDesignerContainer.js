"use strict";

import { useState, useEffect } from "react";
import * as constants from "@/components/core/constants";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import RequestServer from "@/components/core/client/requestServer";

import EDocComponentPalette from "./eDocComponentPalette";
import EDocEditorCanvas from "./eDocEditorCanvas";
import EDocDesignerTopMenu from "./eDocDesignerTopMenu";
import EDocComponentPropertyEditor from "./eDocComponentPropertyEditor";
import EDocDocumentPropertyEditor from "./eDocDocumentPropertyEditor";
import EDocPagePropertyEditor from "./eDocPagePropertyEditor";
import * as commonFunctions from "@/components/core/commonFunctions";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AIInputModal from "@/components/core/client/aiInputModal";
import Loading from "@/components/core/client/loading";

import * as InputComponent from "@/components/eDoc/eDocComponent/eDocComponent_Input";
import * as TextComponent from "@/components/eDoc/eDocComponent/eDocComponent_Text";
import * as ImageComponent from "@/components/eDoc/eDocComponent/eDocComponent_Image";
import * as TableComponent from "@/components/eDoc/eDocComponent/eDocComponent_Table";
import * as CheckListComponent from "@/components/eDoc/eDocComponent/eDocComponent_CheckList";
import * as ButtonComponent from "@/components/eDoc/eDocComponent/eDocComponent_Button";
import * as VideoComponent from "@/components/eDoc/eDocComponent/eDocComponent_Video";
import * as LinkTextComponent from "@/components/eDoc/eDocComponent/eDocComponent_LinkText";
import * as LottieComponent from "@/components/eDoc/eDocComponent/eDocComponent_Lottie";

export default function EDocDesignerContainer({
  documentId,
  triggermenureload,
}) {
  const { BrunnerMessageBox, openModal } = useModal();

  const [loading, setLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [mode, setMode] = useState("design");
  const [componentTemplates, setComponentTemplates] = useState([]);
  const [documentData, setDocumentData] = useState({
    id: documentId || null,
    runtime_data: {
      title: "New Document",
      description: "신규 문서",
      isPublic: false,
      backgroundColor: "#ffffff",
      padding: 1,
      menu_path: null, // 메뉴 경로는 나중에 설정
    },
    pages: [
      {
        id: "page-1",
        components: [],
        runtime_data: {
          padding: 24,
          alignment: "center",
          backgroundColor: "#ffffff",
          pageSize: "A4",
        },
      },
    ],
  });

  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [documentList, setDocumentList] = useState([]);
  const [showDocumentListModal, setShowDocumentListModal] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const [isResizing, setIsResizing] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

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

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    setResizeStartX(e.clientX); // 드래그 시작 시 마우스 X 위치
    setResizeStartWidth(rightPanelWidth); // 드래그 시작 시 패널 너비 저장
  };

  const handleMouseUp = () => {
    if (isResizing) setIsResizing(false);
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const deltaX = resizeStartX - e.clientX;
      const newWidth = resizeStartWidth + deltaX; // 시작 시점 기준으로 너비 계산
      setRightPanelWidth(Math.max(100, newWidth)); // 최소 너비 제한
    }
  };

  const toggleMode = () =>
    setMode((prev) => (prev === "design" ? "runtime" : "design"));

  const handleNewDocument = () => {
    if (!userInfo.isLogin()) {
      openModal(constants.messages.LOGIN_REQUIRED);
      return;
    }

    if (
      window.confirm(
        "현재 작업 중인 문서가 저장되지 않을 수 있습니다. 새 문서를 생성하시겠습니까?"
      )
    ) {
      const title = window.prompt("새문서 이름을 입력하세요");
      setDocumentData({
        id: documentId || null,
        runtime_data: {
          title: "New Document",
          description: "신규 문서",
          isPublic: false,
          backgroundColor: "#ffffff",
          padding: 1,
          menu_path: null, // 메뉴 경로는 나중에 설정
        },
        pages: [
          {
            id: "page-1",
            components: [],
            runtime_data: {
              padding: 24,
              alignment: "center",
              backgroundColor: "#ffffff",
              pageSize: "A4",
            },
          },
        ],
      });
      setCurrentPageIdx(0);
      setSelectedComponentId(null);
    }
  };

  const handleOpenDocument = async () => {
    if (!userInfo.isLogin()) {
      openModal(constants.messages.LOGIN_REQUIRED);
      return;
    }

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
    setLoading(true);
    const loadedDocument = await commonFunctions.getDocumentData(
      userInfo.getLoginUserId(),
      id
    );
    setLoading(false);

    setDocumentData(loadedDocument);
    setCurrentPageIdx(0);
    setSelectedComponentId(null);
  };

  const handleSaveDocument = async () => {
    if (!userInfo.isLogin()) {
      openModal(constants.messages.LOGIN_REQUIRED);
      return;
    }

    if (
      !documentData.id &&
      documentData.runtime_data.title === "New Document"
    ) {
      const result = await openModal(
        constants.messages.SAVE_DOCUMENT_WITHOUT_TITLE
      );
      if (!result) return;
    }

    const jRequest = {
      commandName: constants.commands.EDOC_DOCUMENT_UPSERT_ONE,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
      documentData: documentData,
    };
    setLoading(true);
    const jResponse = await RequestServer(jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      if (triggermenureload) triggermenureload();
      openModal(constants.messages.SUCCESS_SAVED);
      setDocumentData(jResponse.documentData);
      setCurrentPageIdx(0);
    } else {
      openModal(jResponse.error_message);
    }
  };

  const handleDeleteDocument = async () => {
    if (!userInfo.isLogin()) {
      openModal(constants.messages.LOGIN_REQUIRED);
      return;
    }

    const result = await openModal(constants.messages.DELETE_ITEM);
    if (!result) return;

    const jRequest = {
      commandName: constants.commands.EDOC_DOCUMENT_DELETE_ONE,
      systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
      userId: userInfo.getLoginUserId(),
      documentId: documentData.id,
    };
    setLoading(true);
    const jResponse = await RequestServer(jRequest);
    setLoading(false);

    if (jResponse.error_code === 0) {
      if (triggermenureload) triggermenureload();
      openModal(constants.messages.SUCCESS_DELETED);
      setDocumentData({
        id: null,
        pages: [
          {
            id: "page-1",
            components: [],
            runtime_data: {
              padding: 24,
              alignment: "center",
              backgroundColor: "#ffffff",
              pageSize: "A4",
            },
          },
        ],
        runtime_data: {
          title: "New Document",
          description: "신규 문서",
          isPublic: false,
          backgroundColor: "#ffffff",
          padding: 1,
          menu_path: null, // 메뉴 경로는 나중에 설정
        },
      });
      setCurrentPageIdx(0);
      setSelectedComponentId(null);
    } else openModal(jResponse.error_message);
  };

  const handleAddPage = () => {
    if (!userInfo.isLogin()) {
      openModal(constants.messages.LOGIN_REQUIRED);
      return;
    }

    const newPageId = `page-${documentData.pages.length + 1}`;
    const newPage = {
      id: newPageId,
      components: [],
      runtime_data: { pageSize: "A4", padding: 24, backgroundColor: "white" },
    };

    setDocumentData((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
    }));
    setCurrentPageIdx(documentData.pages.length);
  };

  const handleDeleteCurrentPage = async () => {
    if (!userInfo.isLogin()) {
      openModal(constants.messages.LOGIN_REQUIRED);
      return;
    }

    if (documentData.pages.length === 1) {
      openModal(constants.messages.MINIUM_PAGE_COUNT);
      return;
    }
    const confirm = await openModal(
      `The index ${currentPageIdx + 1}, ${
        constants.messages.DELETE_SELECTED_PAGE
      }`
    );
    if (!confirm) return;

    setDocumentData((prev) => {
      const newPages = [...prev.pages];
      newPages.splice(currentPageIdx, 1);
      return {
        ...prev,
        pages: newPages,
      };
    });
    setCurrentPageIdx(currentPageIdx > 0 ? currentPageIdx - 1 : 0);
  };

  const handleAddComponent = (component) => {
    if (!userInfo.isLogin()) {
      openModal(constants.messages.LOGIN_REQUIRED);
      return;
    }

    const baseComponent = { ...component };
    const defaultRuntimeData = {
      width: "auto",
      height: "",
      forceNewLine: true,
    };
    switch (component.template_json.type) {
      case constants.edocComponentType._TEXT:
        baseComponent.runtime_data =
          TextComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._IMAGE:
        baseComponent.runtime_data =
          ImageComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._INPUT:
        baseComponent.runtime_data =
          InputComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._TABLE:
        baseComponent.runtime_data =
          TableComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._CHECKLIST:
        baseComponent.runtime_data =
          CheckListComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._BUTTON:
        baseComponent.runtime_data =
          ButtonComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._VIDEO:
        baseComponent.runtime_data =
          VideoComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._LINKTEXT:
        baseComponent.runtime_data =
          LinkTextComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;
      case constants.edocComponentType._LOTTIE:
        baseComponent.runtime_data =
          LottieComponent.initDefaultRuntimeData(defaultRuntimeData);
        break;

      default:
        break;
    }
    setDocumentData((prev) => {
      const newPages = [...prev.pages];
      newPages[currentPageIdx] = {
        ...newPages[currentPageIdx],
        components: [...newPages[currentPageIdx].components, baseComponent],
      };
      return { ...prev, pages: newPages };
    });
  };

  const handleComponentSelect = (idx) => setSelectedComponentId(idx);

  const handleUpdateComponent = (updatedComponent) => {
    if (selectedComponentId === null) return;
    setDocumentData((prev) => {
      const newPages = [...prev.pages];
      const newComponents = [...newPages[currentPageIdx].components];
      newComponents[selectedComponentId] = updatedComponent;
      newPages[currentPageIdx].components = newComponents;
      return { ...prev, pages: newPages };
    });
  };

  const handleMoveComponentUp = () => {
    if (selectedComponentId === null || selectedComponentId <= 0) return;
    setDocumentData((prev) => {
      const newPages = [...prev.pages];
      const components = [...newPages[currentPageIdx].components];
      [components[selectedComponentId - 1], components[selectedComponentId]] = [
        components[selectedComponentId],
        components[selectedComponentId - 1],
      ];
      newPages[currentPageIdx].components = components;
      return { ...prev, pages: newPages };
    });
    setSelectedComponentId((prev) => prev - 1);
  };

  const handleMoveComponentDown = () => {
    const comps = documentData.pages[currentPageIdx].components;
    if (selectedComponentId === null || selectedComponentId >= comps.length - 1)
      return;
    setDocumentData((prev) => {
      const newPages = [...prev.pages];
      const components = [...newPages[currentPageIdx].components];
      [components[selectedComponentId + 1], components[selectedComponentId]] = [
        components[selectedComponentId],
        components[selectedComponentId + 1],
      ];
      newPages[currentPageIdx].components = components;
      return { ...prev, pages: newPages };
    });
    setSelectedComponentId((prev) => prev + 1);
  };

  const handleDeleteComponent = () => {
    if (selectedComponentId === null) return;
    setDocumentData((prev) => {
      const newPages = [...prev.pages];
      const components = [...newPages[currentPageIdx].components];
      components.splice(selectedComponentId, 1);
      newPages[currentPageIdx].components = components;
      return { ...prev, pages: newPages };
    });
    setSelectedComponentId(null);
  };

  const handleExportPdf = async () => {
    if (!userInfo.isLogin()) {
      openModal(constants.messages.LOGIN_REQUIRED);
      return;
    }

    setIsExportingPdf(true);
    const canvas = await html2canvas(
      document.querySelector(".edoc-designer-canvas"),
      { scale: 2 }
    );
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${documentData.runtime_data.title || "document"}.pdf`);

    setIsExportingPdf(false);
  };

  const handleAIResponse = async (aiResponse) => {
    const newDoc = {
      ...aiResponse.documentData,
      title: aiResponse.documentData.runtime_data.title,
    };

    setDocumentData(newDoc);
    setCurrentPageIdx(0);
    openModal("문서가 자동 생성되었습니다!");
  };

  const handleDocumentListClick = (doc) => {
    setShowDocumentListModal(false);
    openDocumentById(doc.id);
  };

  const ModeToggleButton = () => {
    return (
      <button
        onClick={toggleMode}
        className="flex 
                      flex-row 
                      justify-center 
                      rounded-lg 
                      hover:bg-gray-200 
                      dark:hover:bg-gray-700"
        title={mode === "design" ? "To Runtime Mode" : "To Design Mode"}
      >
        {mode === "design" ? (
          // 런타임 모드 아이콘 (▶ 플레이 버튼 느낌)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 3l14 9-14 9V3z"
            />
          </svg>
        ) : (
          // 디자인 모드 아이콘 (연필 아이콘)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l2.651 2.651a2 2 0 010 2.828l-9.9 9.9a4 4 0 01-1.414.94l-3.53 1.178a.5.5 0 01-.633-.633l1.178-3.53a4 4 0 01.94-1.414l9.9-9.9a2 2 0 012.828 0z"
            />
          </svg>
        )}
      </button>
    );
  };

  // 현재 페이지를 위로 이동
  const handleMovePageUp = () => {
    if (currentPageIdx <= 0) return; // 첫 페이지는 이동 불가
    setDocumentData((prev) => {
      const newPages = [...prev.pages];
      [newPages[currentPageIdx - 1], newPages[currentPageIdx]] = [
        newPages[currentPageIdx],
        newPages[currentPageIdx - 1],
      ];
      return { ...prev, pages: newPages };
    });
    setCurrentPageIdx((prev) => prev - 1);
  };

  // 현재 페이지를 아래로 이동
  const handleMovePageDown = () => {
    if (currentPageIdx >= documentData.pages.length - 1) return; // 마지막 페이지는 이동 불가
    setDocumentData((prev) => {
      const newPages = [...prev.pages];
      [newPages[currentPageIdx + 1], newPages[currentPageIdx]] = [
        newPages[currentPageIdx],
        newPages[currentPageIdx + 1],
      ];
      return { ...prev, pages: newPages };
    });
    setCurrentPageIdx((prev) => prev + 1);
  };

  return (
    <>
      <AIInputModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        commandName={constants.commands.EDOC_AI_GENERATE_DOCUMENT}
        onAIResponse={handleAIResponse}
      />

      {/* 문서 선택 모달 */}
      {showDocumentListModal && (
        <div
          className="fixed 
                     inset-0 
                     bg-black 
                     bg-opacity-50 
                     flex 
                     justify-center 
                     items-center 
                     z-50"
        >
          <div
            className="bg-white 
                          semi-bg-color 
                          rounded-xl 
                          shadow-xl 
                          w-96 
                          max-h-96 
                          overflow-auto 
                          p-4
                          border 
                          border-gray-200 
                          dark:border-slate-700"
          >
            <h3
              className="text-lg 
                           font-bold 
                           mb-4 
                           general-text-color"
            >
              문서 선택
            </h3>
            <ul>
              {documentList.map((doc) => (
                <li
                  key={doc.id}
                  className="cursor-pointer
                             border-b 
                             py-2 
                             px-3 
                             hover:bg-slate-200 
                             dark:hover:bg-slate-600 
                             rounded"
                  onClick={() => handleDocumentListClick(doc)}
                >
                  {doc.runtime_data.title} ({doc.id})
                </li>
              ))}
            </ul>
            <button
              className="mt-4 
                        px-4 
                        py-2 
                        general-bg-color 
                        rounded 
                        hover:medium-bg-color 
                        dark:hover:medium-bg-color"
              onClick={() => setShowDocumentListModal(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto relative">
        {loading && <Loading />}
      </div>
      <h2 className={`page-title`}>Designer</h2>
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
        totalPageCount={documentData?.pages?.length}
        setCurrentPageIdx={setCurrentPageIdx}
        setModalOpen={setModalOpen}
      />
      <div className="flex flex-row justify-center mt-3">
        <ModeToggleButton />
      </div>
      <div className="flex flex-row h-screen mt-10">
        {/* 좌측 컴포넌트 팔레트 */}
        <div className="flex flex-row">
          <aside
            className={`transition-all 
                       duration-300 
                       overflow-auto 
                       border-r 
                       general-text-bg-color
                       ${isLeftPanelOpen ? "w-24" : "w-0"}`}
          >
            {isLeftPanelOpen && (
              <EDocComponentPalette
                templates={componentTemplates}
                onAddComponent={handleAddComponent}
              />
            )}
          </aside>
          {/* 좌측 패널 토글 버튼 (항상 보임, 패널 우측에 겹치도록) */}
          <button
            onClick={() => setIsLeftPanelOpen((prev) => !prev)}
            className="flex 
                        flex-col 
                        items-center 
                        justify-center 
                        text-gray-800 
                        dark:text-gray-200 
                        bg-transparent z-10"
          >
            {isLeftPanelOpen ? "◀" : "▶"}
          </button>
        </div>
        {/* 중앙 편집 캔버스 */}
        <div className="flex-1 overflow-auto">
          {documentData && (
            <h1
              className="text-2xl 
                          font-bold 
                          mx-4 
                          mb-4 
                          text-center
                          general-text-color"
            >
              {documentData.runtime_data.title || ""} : {documentData.id}
            </h1>
          )}

          {/* 도큐먼트 객체 (디자인 타임) */}
          <main
            className="pt-16 flex-grow edoc-designer-canvas"
            style={{
              backgroundColor:
                documentData.runtime_data.backgroundColor || "#f8f8f8",
              padding: `${documentData.runtime_data.padding}px`,
            }}
          >
            {documentData.pages.map((page, idx) => (
              <>
                <div
                  key={page.id}
                  className={`relative 
                             w-fit 
                             my-1
                             mx-auto`}
                  onClick={() => {
                    setCurrentPageIdx(idx);
                    setSelectedComponentId(null);
                  }}
                >
                  <div className="flex flex-row justify-around">
                    <div className="flex flex-row justify-center items-center gap-2 mt-2">
                      <button
                        onClick={handleMovePageUp}
                        className="mb-1 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                        disabled={currentPageIdx === 0}
                      >
                        ▲
                      </button>
                      <div
                        className="general-text-bg-color 
                              border
                              border-gray
                              text-center
                              items-center
                              text-xs 
                              rounded 
                              mb-1
                              select-none 
                              pointer-events-none"
                      >
                        p{idx + 1}
                      </div>
                      <button
                        onClick={handleMovePageDown}
                        className="mb-1 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                        disabled={
                          currentPageIdx === documentData.pages.length - 1
                        }
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <EDocEditorCanvas
                    documentData={documentData}
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
                  />
                </div>
              </>
            ))}
          </main>
        </div>

        {/* 오른쪽 속성 편집창 */}
        {/* 리사이저 바 */}
        {isRightPanelOpen && (
          <div
            onMouseDown={handleMouseDown}
            className="absoulte top-0 left-0 w-1 h-full cursor-col-resize bg-gray-300 hover:bg-gray-400"
          />
        )}

        <aside
          className={`flex flex-col justify-start 
                     relative general-text-bg-color 
                     border-gray 
                     dark:border-gray 
                     p-4 
                     overflow-auto 
                     transition-all 
                     duration-100`}
          style={{ width: isRightPanelOpen ? `${rightPanelWidth}px` : "0px" }}
        >
          {/* 우측 패널 토글 버튼 */}
          <button
            onClick={() => setIsRightPanelOpen((prev) => !prev)}
            className="absolute top-1/2 left-0 -translate-y-1/2 p-2
                     text-gray-800 dark:text-gray-200 bg-transparent z-10"
          >
            {isRightPanelOpen ? "▶" : "◀"}
          </button>

          {isRightPanelOpen && (
            <>
              <h2 className="flex flex-col items-center text-lg font-semibold mb-4 general-text-color">
                속성창
              </h2>
              {selectedComponentId !== null &&
              documentData.pages[currentPageIdx]?.components[
                selectedComponentId
              ] ? (
                <EDocComponentPropertyEditor
                  component={
                    documentData.pages[currentPageIdx].components[
                      selectedComponentId
                    ]
                  }
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
                  <EDocPagePropertyEditor
                    runtimeData={
                      documentData.pages[currentPageIdx]?.runtime_data || {}
                    }
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
            </>
          )}
        </aside>
      </div>

      {/* 메시지 박스 */}
      <BrunnerMessageBox />
    </>
  );
}
