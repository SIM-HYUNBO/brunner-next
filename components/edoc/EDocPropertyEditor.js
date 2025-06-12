import * as constants from "@/components/constants";

export default function EDocPropertyEditor({ component, onComponentChange }) {
  if (!component) return <p>컴포넌트를 선택하세요.</p>;

  switch (component.type) {
    case constants.edoc.COMPONENT_TYPE_TEXT:
      return (
        <div>
          <label>내용 수정:</label>
          <textarea
            value={component.content}
            onChange={(e) => {
              onComponentChange({ ...component, content: e.target.value });
            }}
            rows={4}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
      );

    case constants.edoc.COMPONENT_TYPE_TABLE:
      return (
        <div>
          <label>행 수:</label>
          <input
            type="number"
            min={1}
            value={component.rows}
            onChange={(e) => {
              onComponentChange({ ...component, rows: parseInt(e.target.value) || 1 });
            }}
            className="w-full border border-gray-300 rounded p-1 mb-2"
          />
          <label>열 수:</label>
          <input
            type="number"
            min={1}
            value={component.cols}
            onChange={(e) => {
              onComponentChange({ ...component, cols: parseInt(e.target.value) || 1 });
            }}
            className="w-full border border-gray-300 rounded p-1"
          />
        </div>
      );

    case 'image':
      return (
        <div>
          <label>이미지 URL:</label>
          <input
            type="text"
            value={component.src}
            onChange={(e) => {
              onComponentChange({ ...component, src: e.target.value });
            }}
            className="w-full border border-gray-300 rounded p-2"
          />
          {component.src && (
            <img
              src={component.src}
              alt="선택된 이미지"
              className="mt-2 max-w-full h-auto border"
            />
          )}
        </div>
      );

    case 'input':
      return (
        <div>
          <label>플레이스홀더:</label>
          <input
            type="text"
            value={component.placeholder || ''}
            onChange={(e) => {
              onComponentChange({ ...component, placeholder: e.target.value });
            }}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
      );

    default:
      return <p>속성 편집이 지원되지 않는 컴포넌트입니다.</p>;
  }
}