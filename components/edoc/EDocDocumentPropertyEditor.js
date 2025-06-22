`use strict`

export default function EDocDocumentPropertyEditor({ runtimeData, onChange }) {
  if (!runtimeData) return <p>문서 속성 데이터를 불러오세요.</p>;

  const updateProperty = (key, value) => {
    onChange({
      ...runtimeData,
      [key]: value,
    });
  };

  return (
    <div>
      <label>여백 (padding, px):</label>
      <input
        type="number"
        value={runtimeData.padding || 24}
        onChange={(e) =>
          updateProperty('padding', parseInt(e.target.value) || 24)
        }
        className="w-full border border-gray-300 rounded p-2 mb-3"
      />

      <label>정렬 (positionAlign):</label>
      <select
        value={runtimeData.positionAlign || 'center'}
        onChange={(e) => updateProperty('positionAlign', e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-3"
      >
        <option value="left">왼쪽</option>
        <option value="center">가운데</option>
        <option value="right">오른쪽</option>
      </select>

      <label>배경색 (backgroundColor):</label>
      <input
        type="color"
        value={runtimeData.backgroundColor || '#ffffff'}
        onChange={(e) =>
          updateProperty('backgroundColor', e.target.value)
        }
        className="w-full h-10 p-1 mb-3 border border-gray-300 rounded"
      />

      <label>페이지 크기 (pageSize):</label>
      <select
        value={runtimeData.pageSize || 'A4'}
        onChange={(e) => updateProperty('pageSize', e.target.value)}
        className="w-full border border-gray-300 rounded p-2"
      >
        <option value="A4">A4</option>
        <option value="A3">A3</option>
        <option value="Letter">Letter</option>
        <option value="Legal">Legal</option>
      </select>
    </div>
  );
}