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
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [mode, setMode] = useState("design"); // "design" or "runtime"
  const [showProperty, setShowProperty] = useState(false); // 오른쪽 속성창 토글

  const toggleMode = () => {
    setMode((prev) => (prev === "design" ? "runtime" : "design"));
  };

  // 이하 기존 useEffect, 상태, 함수 그대로 유지 ...

  const { BrunnerMessageBox, openModal } = useModal();
  const [loading, setLoading] = useState(false);

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

  // ...생략: 기존 함수들 (handleAddPage, handleDeleteCurrentPage, openDocumentById, 등) 그대로 유지...

  return (
    <>
      <BrunnerMessageBox />
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}

      <div className="flex h-screen bg-gray-100">
        {/* 왼쪽 사이드바 폭 축소: w-40 (160px) */}
        <aside className="w-40 bg-white border-r border-gray-300 p-4 overflow-y-auto">
          <button className="text-lg font-semibold mb-4" onClick={toggleMode}>
            {mode === "design" ? "To Runtime Mode" : "To Design Mode"}
          </button>        
          <h2 className="text-lg font-semibold mb-4">컴포넌트 템플릿</h2>
          <EDocComponentPalette
            templates={componentTemplates}
            onAddComponent={handleAddComponent}
          />
        </aside>

        {/* 중앙 편집 영역: flex-1 */}
        <main className="flex-1 flex flex-col overflow-auto p-4 relative">
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
              // 속성창 토글 버튼 추가
              extraButtons={
                <button
                  className="ml-4 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setShowProperty(prev => !prev)}
                >
                  {showProperty ? '속성창 닫기' : '속성창 열기'}
                </button>
              }
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
                className="relative w-fit mx-auto border border-dashed border-gray-400 mb-6"
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

        {/* 오른쪽 속성창: w-60 (240px), 작은 화면에서 숨기고 토글로 오버레이 처리 */}
        {/* md 이상에서만 기본 노출 */}
        <aside className={`bg-white border-l border-gray-300 p-4 overflow-y-auto
          fixed top-0 right-0 h-full w-60 z-50
          transform transition-transform duration-300
          md:static md:translate-x-0
          ${showProperty ? 'translate-x-0' : 'translate-x-full'}
          hidden md:block
        `}>
          <h2 className="text-lg font-semibold mb-4">속성창</h2>
          {pages[currentPageIdx]?.components[selectedComponentId] ? (
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
              onChangeRuntimeData={(updatedRuntimeData) => {
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
          {/* 모바일/작은 화면에서 닫기 버튼 */}
          <button
            className="md:hidden mt-4 px-4 py-2 bg-gray-300 rounded"
            onClick={() => setShowProperty(false)}
          >
            닫기
          </button>
        </aside>
      </div>

      {/* 문서 목록 모달 */}
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
