export const initDefaultRuntimeData = (defaultRuntimeData) => {
  defaultRuntimeData.itemCount = 3;
  defaultRuntimeData.items = Array.from({ length: 3 }, (_, i) => ({ label: `항목 ${i + 1}`, checked: false}));
  defaultRuntimeData.positionAlign = "left";
  
  return defaultRuntimeData;
}

export const getNewRuntimeData = (component, newData) => {
  const currentData = component.runtime_data || {};
  let newRuntimeData = { ...currentData };
  const [itemIdx, checked] = newData;
  const items = [...(currentData.items || [])];
  
  if (items[itemIdx]) {
    items[itemIdx] = { ...items[itemIdx], checked };
    newRuntimeData.items = items;
  }
  return newRuntimeData;
}

export function renderProperty({ component, renderWidthInput, renderForceNewLineToggle, renderPositionAlignSelect, updateRuntimeData}) {
  
  const renderComponentProperty = (component) => {

    const items = component.runtime_data?.items || [];

    const updateItemLabel = (idx, newLabel) => {
      const newItems = items.map((item, i) =>
        i === idx ? { ...item, label: newLabel } : item
      );
      updateRuntimeData("items", newItems);
    };

    const toggleItemChecked = (idx) => {
      const newItems = items.map((item, i) =>
        i === idx ? { ...item, checked: !item.checked } : item
      );
      updateRuntimeData("items", newItems);
    };

    const addItem = () => {
      const newItems = [...items, { label: `항목 ${items.length + 1}`, checked: false }];
      updateRuntimeData("items", newItems);
    };

    const removeItem = (idx) => {
      const newItems = items.filter((_, i) => i !== idx);
      updateRuntimeData("items", newItems);
    };

    return (
      <div>
        <label>Binding Key:</label>
        <input
          type="text"
          value={component.runtime_data?.bindingKey || ''}
          onChange={(e) => updateRuntimeData("bindingKey", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />

        {renderWidthInput()}
        {renderForceNewLineToggle()}
        {renderPositionAlignSelect()}

        <label>내용 정렬:</label>
        <select
          value={component.runtime_data?.textAlign || 'left'}
          onChange={(e) => updateRuntimeData("textAlign", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        >
          <option value="left">왼쪽</option>
          <option value="center">가운데</option>
          <option value="right">오른쪽</option>
        </select>

        <label className="block mb-2">항목 목록:</label>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center mb-1 gap-2">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItemChecked(idx)}
            />
            <input
              type="text"
              value={item.label}
              onChange={(e) => updateItemLabel(idx, e.target.value)}
              className="border border-gray-300 rounded p-1 flex-grow"
            />
            <button
              onClick={() => removeItem(idx)}
              className="bg-red-500 text-white px-2 rounded"
              title="항목 삭제"
              type="button"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="mt-2 bg-blue-500 text-white rounded px-4 py-1"
          type="button"
        >
          항목 추가
        </button>
      </div>
    );
  }

  return renderComponentProperty(component);
}

export const renderComponent = ({component, handleComponentClick, selectedClass, alignmentClass, textAlign, onRuntimeDataChange}) => {
  const style = {
    width: component.runtime_data?.width || 'auto',
    height: component.runtime_data?.height || 'auto',
    textAlign, // 텍스트 정렬 적용
  };

  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };
  const justifyContent =
    justifyMap[
      component.runtime_data?.textAlign || 'left'
    ];

  return (
    <div
      className={`${selectedClass} ${alignmentClass} border p-2 cursor-pointer flex flex-col`}
      style={{
        ...style,
        justifyContent,
        alignItems: justifyContent,
      }}
      onClick={handleComponentClick}
    >
      {(component.runtime_data?.items || []).map((item, idx) => (
        <label
          key={idx}
          className="flex items-center space-x-2 mb-1"
          style={{ justifyContent }}
        >
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(e) => onRuntimeDataChange([idx, e.target.checked])}
          />
          <span>{item.label || `항목 ${idx + 1}`}</span>
        </label>
      ))}
    </div>
  );
}