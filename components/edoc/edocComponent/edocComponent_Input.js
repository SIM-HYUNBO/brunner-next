export default function renderProperty({ component, renderWidthInput,  renderForceNewLineToggle, renderPositionAlignSelect, updateRuntimeData}) {
  const renderComponentProperty = (component) => {
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

        <label>텍스트:</label>
        <input
          type="text"
          value={component.runtime_data?.value || ''}
          onChange={(e) => updateRuntimeData("value", e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-2"
        />

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
      </div>
    );
  }

  return renderComponentProperty(component);
}

export const renderComponent = ({component, handleComponentClick, selectedClass, alignmentClass, textAlign, onRuntimeDataChange}) => {
  const style = {
    width: '100%',
    height: component.runtime_data?.height || 'auto',
    textAlign, // 텍스트 정렬 적용
  };

  return (
    <input
      type="text"
      className={`${selectedClass} ${alignmentClass} h-8 cursor-pointer`}
      style={{ ...style }}
      value={component.runtime_data?.value || ''}
      placeholder={component.runtime_data?.placeholder || ''}
      onClick={handleComponentClick}
      onChange={(e) => onRuntimeDataChange(e.target.value)}
    />
  );
}

export const defaultRuntimeData = () => {
  var defaultRuntimeData = {
      width: 'auto', // 기본 폭 지정
      height: '',
      forceNewLine: true
    };

  defaultRuntimeData.placeholder = "값을 입력하세요";
  defaultRuntimeData.textAlign = "left";
  defaultRuntimeData.positionAlign = "left";
  return defaultRuntimeData;
}

export const getNewRuntimeData = (component, newData) => {
  const currentData = component.runtime_data || {};
  let newRuntimeData = { ...currentData };

  newRuntimeData.value = newData;

  return newRuntimeData;
}