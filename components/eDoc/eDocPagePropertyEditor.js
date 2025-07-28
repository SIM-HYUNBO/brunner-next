'use strict'

export default function EDocPagePropertyEditor({
  runtimeData = {},
  onChangeRuntimeData,
}) {
  if (!runtimeData) return <p>페이지 데이터를 불러오세요.</p>;

  const updateProperty = (key, value) => {
    onChangeRuntimeData({
      ...runtimeData,
      [key]: value,
    });
  };

  return (
    <section className="p-4 border rounded shadow-sm">
      <h2 className="text-lg font-semibold mb-3">페이지 속성</h2>

      <label>Padding (px)</label>
      <input
        type="number"
        value={runtimeData.padding ?? 24}
        onChange={(e) => updateProperty('padding', parseInt(e.target.value) ?? 24)}
        className="w-full border border-gray-300 rounded p-2 mb-3"
      />

      <label>Page Background Color</label>
      <input
        type="color"
        value={runtimeData.backgroundColor || '#ffffff'}
        onChange={(e) => updateProperty('backgroundColor', e.target.value)}
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
    </section>
  );
}