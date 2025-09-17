`use strict`;

import * as constants from "@/components/core/constants";

import TextComponent from "@/components/eDoc/eDocComponent/eDocComponent_Text";
import InputComponent from "@/components/eDoc/eDocComponent/eDocComponent_Input";
import ImageComponent from "@/components/eDoc/eDocComponent/eDocComponent_Image";
import TableComponent from "@/components/eDoc/eDocComponent/eDocComponent_Table";
import CheckListComponent from "@/components/eDoc/eDocComponent/eDocComponent_CheckList";
import ButtonComponent from "@/components/eDoc/eDocComponent/eDocComponent_Button";
import VideoComponent from "@/components/eDoc/eDocComponent/eDocComponent_Video";
import LinkTextComponent from "@/components/eDoc/eDocComponent/eDocComponent_LinkText";
import LottieComponent from "@/components/eDoc/eDocComponent/eDocComponent_Lottie";

export default function DocComponentRenderer({
  documentData,
  pageData,
  component,
  isSelected,
  onSelect,
  onRuntimeDataChange,
  mode,
}) {
  const selectedClass = isSelected
    ? "outline outline-2 outline-blue-500 rounded bg-blue-50"
    : "";

  // 내부 텍스트 정렬 (content 정렬용)
  const textAlign =
    component.runtime_data?.textAlign ||
    pageData?.runtime_data?.alignment ||
    "left";
  var alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[textAlign];

  if (component.type === constants.edocComponentType._IMAGE) {
    const positionAlign = component.runtime_data?.positionAlign || "center";
    alignmentClass =
      positionAlign === "right"
        ? "flex justify-end"
        : positionAlign === "left"
        ? "flex justify-start"
        : positionAlign === "center"
        ? "flex justify-center"
        : "";
  }

  const handleComponentClick = (e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    onSelect();
  };

  const renderProps = {
    documentData: documentData,
    pageData,
    component,
    handleComponentClick,
    onRuntimeDataChange,
    selectedClass,
    alignmentClass,
    textAlign,
    isDesignMode: mode === "design",
  };

  switch (component.type) {
    case constants.edocComponentType._TEXT:
      return <TextComponent {...renderProps} />;
    case constants.edocComponentType._INPUT:
      return <InputComponent {...renderProps} />;
    case constants.edocComponentType._IMAGE:
      return <ImageComponent {...renderProps} />;
    case constants.edocComponentType._TABLE:
      return <TableComponent {...renderProps} />;
    case constants.edocComponentType._CHECKLIST:
      return <CheckListComponent {...renderProps} />;
    case constants.edocComponentType._BUTTON:
      return <ButtonComponent {...renderProps} />;
    case constants.edocComponentType._VIDEO:
      return <VideoComponent {...renderProps} />;
    case constants.edocComponentType._LINKTEXT:
      return <LinkTextComponent {...renderProps} />;
    case constants.edocComponentType._LOTTIE:
      return <LottieComponent {...renderProps} />;
    default:
      return null;
  }
}
