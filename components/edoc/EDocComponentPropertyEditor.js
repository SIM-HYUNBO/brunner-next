`use strict`

import * as constants from "@/components/constants";

import * as TextComponent from "@/components/edoc/edocComponent/edocComponent_Text";
import * as InputComponent from "@/components/edoc/edocComponent/edocComponent_Input";
import * as ImageComponent from "@/components/edoc/edocComponent/edocComponent_Image";
import * as TableComponent from "@/components/edoc/edocComponent/edocComponent_Table";
import * as CheckListComponent from "@/components/edoc/edocComponent/edocComponent_CheckList";

/*
 * EDocPropertyEditor.js
 * EDoc 컴포넌트의 속성을 편집하는 컴포넌트
 */
export default function EDocComponentPropertyEditor({ component, handleUpdateComponent }) {
  if (!component) return <p>컴포넌트를 선택하세요.</p>;

  const updateRuntimeData = (key, value) => {
    const newRuntimeData = {
      ...component.runtime_data,
      [key]: value,
    };

    handleUpdateComponent({
      ...component,
      runtime_data: newRuntimeData,
    });
  };

  const renderWidthProperty = () => (
    <>
      <label className="block mt-2 mb-1">폭 (예: 100%, 400px):</label>
      <input
        type="text"
        value={component.runtime_data?.width || '100%'}
        onChange={(e) => updateRuntimeData("width", e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />
    </>
  );

  const renderForceNewLineProperty = () => (
    <div className="mt-2 mb-2">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          checked={!!component.runtime_data?.forceNewLine}
          onChange={(e) => updateRuntimeData("forceNewLine", e.target.checked)}
          className="mr-2"
        />
        다음줄에 표시
      </label>
    </div>
  );

  const renderPositionAlignProperty = () => (
    <>
      <label>정렬:</label>
      <select
        value={component.runtime_data?.positionAlign || 'left'}qk
        onChange={(e) => updateRuntimeData("positionAlign", e.target.value)}
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
      case constants.edoc.COMPONENT_TYPE_TEXT:
        return TextComponent.renderProperty(
                                            component, 
                                            updateRuntimeData, 
                                            {
                                              renderWidthProperty, 
                                              renderForceNewLineProperty, 
                                              renderPositionAlignProperty
                                            });
      case constants.edoc.COMPONENT_TYPE_TABLE:
        return TableComponent.renderProperty(component, updateRuntimeData, {
          renderWidthProperty, 
          renderForceNewLineProperty, 
          renderPositionAlignProperty});
      case constants.edoc.COMPONENT_TYPE_INPUT:
        return InputComponent.renderProperty(component, updateRuntimeData, {
          renderWidthProperty, 
          renderForceNewLineProperty, 
          renderPositionAlignProperty});

      case constants.edoc.COMPONENT_TYPE_IMAGE:
        return ImageComponent.renderProperty(component, updateRuntimeData, {
          renderWidthProperty, 
          renderForceNewLineProperty, 
          renderPositionAlignProperty});
      case constants.edoc.COMPONENT_TYPE_CHECKLIST:
        return CheckListComponent.renderProperty(component, updateRuntimeData, {
          renderWidthProperty, 
          renderForceNewLineProperty, 
          renderPositionAlignProperty});

      default:
        return <p>속성 편집이 지원되지 않는 컴포넌트입니다.</p>;
    }
  }

  return renderComponentProperty(component);
}
