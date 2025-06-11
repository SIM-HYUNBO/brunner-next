export default function EDocSelectedComponentEditor({ component, onChange }) {
  if (!component) return null;

  const handleChange = (e) => {
    onChange({
      ...component,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-4">
      {/* 공통 속성: content */}
      {component.type === 'text' && (
        <div>
          <label className="block text-sm mb-1">텍스트 내용</label>
          <input
            name="content"
            value={component.content || ''}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      )}
      {component.type === 'table' && (
        <div>
          <label className="block text-sm mb-1">행 수</label>
          <input
            name="rows"
            type="number"
            value={component.rows || 1}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
          <label className="block text-sm mb-1 mt-2">열 수</label>
          <input
            name="cols"
            type="number"
            value={component.cols || 1}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      )}
      {component.type === 'image' && (
        <div>
          <label className="block text-sm mb-1">이미지 URL</label>
          <input
            name="src"
            value={component.src || ''}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      )}
      {component.type === 'input' && (
        <div>
          <label className="block text-sm mb-1">플레이스홀더</label>
          <input
            name="placeholder"
            value={component.placeholder || ''}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      )}
    </div>
  );
}