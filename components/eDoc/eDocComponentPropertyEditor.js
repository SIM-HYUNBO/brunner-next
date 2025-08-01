`use strict`

import * as constants from "@/components/constants";

import * as TextComponent from "@/components/eDoc/eDocComponent/eDocComponent_Text";
import * as InputComponent from "@/components/eDoc/eDocComponent/eDocComponent_Input";
import * as ImageComponent from "@/components/eDoc/eDocComponent/eDocComponent_Image";
import * as TableComponent from "@/components/eDoc/eDocComponent/eDocComponent_Table";
import * as CheckListComponent from "@/components/eDoc/eDocComponent/eDocComponent_CheckList";
import * as ButtonComponent from "@/components/eDoc/eDocComponent/eDocComponent_Button";
import * as VideoComponent from "@/components/eDoc/eDocComponent/eDocComponent_Video";

/*
 * EDocPropertyEditor.js
 * EDoc 컴포넌트의 속성을 편집하는 컴포넌트
 */
export default function EDocComponentPropertyEditor({ component, handleUpdateComponent }) {
  if (!component) return <p>컴포넌트를 선택하세요.</p>;

  const updateRuntimeDataByPropertyEeditor = (key, value) => {
    if(key === 'runtime_data'){
      // 전체 runtime_data 교체
      handleUpdateComponent({
        ...component,
        runtime_data: value,
      });
    }
    else{
       const newRuntimeData = {
          ...component.runtime_data,
          [key]: value,
        };

        handleUpdateComponent({
          ...component,
          runtime_data: newRuntimeData,
        });   
    }
  };

  const renderWidthPropertyByPropertyEditor = () => (
    <>
      <label className="block mt-2 mb-1">폭 (예: 100%, 400px):</label>
      <input
        type="text"
        value={component.runtime_data?.width || '100%'}
        onChange={(e) => updateRuntimeDataByPropertyEeditor("width", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />
    </>
  );

  const renderForceNewLinePropertyByPropertyEditor = () => (
    <div className="mt-2 mb-2">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          checked={!!component.runtime_data?.forceNewLine}
          onChange={(e) => updateRuntimeDataByPropertyEeditor("forceNewLine", e.target.checked)}
          className="mr-2"
        />
        다음줄에 표시
      </label>
    </div>
  );

  const renderPositionAlignPropertyByPropertyEditor = () => (
    <>
      <label>정렬:</label>
      <select
        value={component.runtime_data?.positionAlign || 'left'}
        onChange={(e) => updateRuntimeDataByPropertyEeditor("positionAlign", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      >
        <option value="left">왼쪽</option>
        <option value="center">가운데</option>
        <option value="right">오른쪽</option>
      </select>
    </>
  );

  const renderComponentProperty = (component) => {
    switch (component.type) {
      case constants.edocComponentType._TEXT:
        return TextComponent.renderProperty(component, updateRuntimeDataByPropertyEeditor, renderWidthPropertyByPropertyEditor, renderForceNewLinePropertyByPropertyEditor, renderPositionAlignPropertyByPropertyEditor);
      case constants.edocComponentType._TABLE:
        return TableComponent.renderProperty(component, updateRuntimeDataByPropertyEeditor, renderWidthPropertyByPropertyEditor, renderForceNewLinePropertyByPropertyEditor, renderPositionAlignPropertyByPropertyEditor);
      case constants.edocComponentType._INPUT:
        return InputComponent.renderProperty(component,  updateRuntimeDataByPropertyEeditor, renderWidthPropertyByPropertyEditor, renderForceNewLinePropertyByPropertyEditor, renderPositionAlignPropertyByPropertyEditor);
      case constants.edocComponentType._IMAGE:
        return ImageComponent.renderProperty(component, updateRuntimeDataByPropertyEeditor, renderWidthPropertyByPropertyEditor, renderForceNewLinePropertyByPropertyEditor, renderPositionAlignPropertyByPropertyEditor);
      case constants.edocComponentType._CHECKLIST:
        return CheckListComponent.renderProperty(component, updateRuntimeDataByPropertyEeditor,renderWidthPropertyByPropertyEditor, renderForceNewLinePropertyByPropertyEditor, renderPositionAlignPropertyByPropertyEditor);
      case constants.edocComponentType._BUTTON:
        return ButtonComponent.renderProperty(component, updateRuntimeDataByPropertyEeditor,renderWidthPropertyByPropertyEditor,renderForceNewLinePropertyByPropertyEditor,renderPositionAlignPropertyByPropertyEditor);
      case constants.edocComponentType._VIDEO:
        return VideoComponent.renderProperty(component, updateRuntimeDataByPropertyEeditor,renderWidthPropertyByPropertyEditor,renderForceNewLinePropertyByPropertyEditor,renderPositionAlignPropertyByPropertyEditor);

      default:
        return <p>속성 편집이 지원되지 않는 컴포넌트입니다.</p>;
    }
  }

  return renderComponentProperty(component);
}
