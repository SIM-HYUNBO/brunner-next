`use strict`

import * as constants from '@/components/constants';

import * as TextComponent from "@/components/eDoc/edocComponent/edocComponent_Text";
import * as InputComponent from "@/components/eDoc/edocComponent/edocComponent_Input";
import * as ImageComponent from "@/components/eDoc/edocComponent/edocComponent_Image";
import * as TableComponent from "@/components/eDoc/edocComponent/edocComponent_Table";
import * as CheckListComponent from "@/components/eDoc/edocComponent/edocComponent_CheckList";
import * as ButtonComponent from "@/components/eDoc/edocComponent/edocComponent_Button";

export default function DocComponentRenderer({
  component,
  isSelected,
  onSelect,
  onRuntimeDataChange,
  documentRuntimeData,
  mode,
  bindingData  
}) {
  
  const selectedClass = isSelected
    ? 'outline outline-2 outline-blue-500 rounded bg-blue-50'
    : '';

  // 내부 텍스트 정렬 (content 정렬용)
  const textAlign = component.runtime_data?.textAlign || documentRuntimeData?.alignment || 'left';
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign];

  const handleComponentClick = (e) => {
    e.stopPropagation();
    onSelect();
  };

  const renderComponent = (component) => {
    const isDesignMode = mode === "design";
    const param = {selectedClass, alignmentClass, textAlign, isDesignMode, bindingData};

    switch (component.type) {
      case constants.edoc.COMPONENT_TYPE_TEXT:
        return TextComponent.renderComponent(component, handleComponentClick, onRuntimeDataChange, param);

      case constants.edoc.COMPONENT_TYPE_INPUT:
        return InputComponent.renderComponent(component, handleComponentClick, onRuntimeDataChange, param);

      case constants.edoc.COMPONENT_TYPE_IMAGE:
        return ImageComponent.renderComponent(component, handleComponentClick, onRuntimeDataChange, param);

      case constants.edoc.COMPONENT_TYPE_TABLE:
        return TableComponent.renderComponent(component, handleComponentClick, onRuntimeDataChange, param);

      case constants.edoc.COMPONENT_TYPE_CHECKLIST:
        return CheckListComponent.renderComponent(component, handleComponentClick, onRuntimeDataChange, param);

      case constants.edoc.COMPONENT_TYPE_BUTTON:
        return ButtonComponent.renderComponent(component, handleComponentClick, onRuntimeDataChange, param);

      default:
        return null;
    }    
  }

  return renderComponent(component);
}
