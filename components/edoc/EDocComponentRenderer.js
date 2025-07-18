`use strict`

import * as constants from '@/components/constants';

import TextComponent from "@/components/eDoc/edocComponent/edocComponent_Text";
import InputComponent from "@/components/eDoc/edocComponent/edocComponent_Input";
import ImageComponent from "@/components/eDoc/edocComponent/edocComponent_Image";
import TableComponent from "@/components/eDoc/edocComponent/edocComponent_Table";
import CheckListComponent from "@/components/eDoc/edocComponent/edocComponent_CheckList";
import ButtonComponent from "@/components/eDoc/edocComponent/edocComponent_Button";
import VideoComponent from "@/components/eDoc/edocComponent/edocComponent_Video";

export default function DocComponentRenderer({
  component,
  isSelected,
  onSelect,
  onRuntimeDataChange,
  documentRuntimeData,
  mode,
  bindingData,
  documentData 
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
    if (e && typeof e.stopPropagation === "function") {
    e.stopPropagation();
  }
    onSelect();
  };

  const renderProps = {
    component,
    handleComponentClick,
    onRuntimeDataChange,
    selectedClass,
    alignmentClass,
    textAlign,
    isDesignMode: mode === "design",
    bindingData,
    documentData,
  };

switch (component.type) {
  case constants.edoc.EDOC_COMPONENT_TYPE_TEXT:
    return <TextComponent {...renderProps} />;
  case constants.edoc.EDOC_COMPONENT_TYPE_INPUT:
    return <InputComponent {...renderProps} />;
  case constants.edoc.EDOC_COMPONENT_TYPE_IMAGE:
    return <ImageComponent {...renderProps} />;
  case constants.edoc.EDOC_COMPONENT_TYPE_TABLE:
    return <TableComponent {...renderProps} />;
  case constants.edoc.EDOC_COMPONENT_TYPE_CHECKLIST:
    return <CheckListComponent {...renderProps} />;
  case constants.edoc.EDOC_COMPONENT_TYPE_BUTTON:
    return <ButtonComponent {...renderProps} />;
  case constants.edoc.EDOC_COMPONENT_TYPE_VIDEO:
    return <VideoComponent {...renderProps} />;
  default:
    return null;
}
}