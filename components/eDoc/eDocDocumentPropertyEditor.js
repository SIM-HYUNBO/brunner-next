'use strict'

export default function EDocDocumentPropertyEditor({
  title,
  runtimeData,
  onChangeTitle,
  onChangeRuntimeData,
}) {
  if (!runtimeData) return <p>문서 속성 데이터를 불러오세요.</p>;

  const updateProperty = (key, value) => {
    onChangeRuntimeData({
      ...runtimeData,
      [key]: value,
    });
  };

  return (
    <div>
      {/* ✅ 제목은 별도로 */}
      <label>Title</label>
      <input
        type="text"
        value={title || ''}
        onChange={(e) => onChangeTitle(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-3"
        placeholder="문서 제목 입력"
      />
      
      <label className="flex items-center mb-3">
        <input
          type="checkbox"
          checked={!!runtimeData.isPublic}
          onChange={e => updateProperty('isPublic', e.target.checked)}
          className="mr-2"
        />
        Public Document
      </label>

      {/* 나머지는 그대로 runtimeData */}
      <label>Padding (px)</label>
      <input
        type="number"
        value={runtimeData.padding ?? 24}
        onChange={(e) =>
          updateProperty('padding', parseInt(e.target.value) ?? 24)
        }
        className="w-full border border-gray-300 rounded p-2 mb-3"
      />

      <label>Position Align</label>
      <select
        value={runtimeData.positionAlign || 'center'}
        onChange={(e) => updateProperty('positionAlign', e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-3"
      >
        <option value="left">왼쪽</option>
        <option value="center">가운데</option>
        <option value="right">오른쪽</option>
      </select>

      <label> Background Color</label>
      <input
        type="color"
        value={runtimeData.backgroundColor || '#ffffff'}
        onChange={(e) =>
          updateProperty('backgroundColor', e.target.value)
        }
        className="w-full h-10 p-1 mb-3 border border-gray-300 rounded"
      />

      <label>Page Size</label>
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