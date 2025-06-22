import * as constants from '@/components/constants';

import * as TextComponent from "@/components/edoc/edocComponent/edocComponent_Text";
import * as InputComponent from "@/components/edoc/edocComponent/edocComponent_Input";
import * as ImageComponent from "@/components/edoc/edocComponent/edocComponent_Image";
import * as TableComponent from "@/components/edoc/edocComponent/edocComponent_Table";
import * as CheckListComponent from "@/components/edoc/edocComponent/edocComponent_CheckList";

export default function DocComponentRenderer({
  component,
  isSelected,
  onSelect,
  onRuntimeDataChange,
  documentRuntimeData,
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
    const param = {component, handleComponentClick, selectedClass, alignmentClass, textAlign, onRuntimeDataChange};

    switch (component.type) {
      case constants.edoc.COMPONENT_TYPE_TEXT:
        return TextComponent.renderComponent(param);

      case constants.edoc.COMPONENT_TYPE_INPUT:
        return InputComponent.renderComponent(param);

      case constants.edoc.COMPONENT_TYPE_IMAGE:
        return ImageComponent.renderComponent(param);

      case constants.edoc.COMPONENT_TYPE_TABLE:
        return TableComponent.renderComponent(param);

      case constants.edoc.COMPONENT_TYPE_CHECKLIST:
        return CheckListComponent.renderComponent(param);

      default:
        return null;
    }    
  }

  return renderComponent(component);
}
