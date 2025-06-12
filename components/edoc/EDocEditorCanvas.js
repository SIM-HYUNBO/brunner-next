import React from 'react';
import * as constants from '@/components/constants'

export default function EDocEditorCanvas({ components, selectedComponentId, onComponentSelect }) {
  return (
    <div className="min-h-[500px] border border-dashed border-gray-400 bg-white p-4 rounded">
      {components.length === 0 && (
        <p className="text-gray-500 text-center mt-20">좌측에서 컴포넌트를 추가하세요.</p>
      )}
      {components.map((comp, idx) => (
        <DocComponentRenderer
          key={idx}
          component={comp}
          isSelected={selectedComponentId === idx}
          onSelect={() => onComponentSelect(idx)}
        />
      ))}
    </div>
  );
}

function DocComponentRenderer({ component, isSelected, onSelect }) {
  const baseClass = "mb-3 cursor-pointer";
  const selectedClass = isSelected ? "border-2 border-blue-500 bg-blue-50 rounded" : "";

  switch (component.type) {
    case constants.edoc.COMPONENT_TYPE_TEXT:
      return (
        <p
          className={`${baseClass} ${selectedClass}`}
          onClick={onSelect}
        >
          {component.content.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
      );
    case constants.edoc.COMPONENT_TYPE_TABLE:
      return (
        <table
          className={`${baseClass} ${selectedClass} border border-gray-300`}
          onClick={onSelect}
        >
          <tbody>
            {[...Array(component.rows)].map((_, rIdx) => (
              <tr key={rIdx}>
                {[...Array(component.cols)].map((_, cIdx) => (
                  <td
                    key={cIdx}
                    className="border border-gray-300 px-3 py-1 text-center"
                  >
                    &nbsp;
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case constants.edoc.COMPONENT_TYPE_IMAGE:
      return (
        <div
          className={`${baseClass} ${selectedClass}`}
          onClick={onSelect}
        >
          {component.src ? (
            <img src={component.src} alt="이미지" className="max-w-full h-auto" />
          ) : (
            <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500">
              이미지 없음
            </div>
          )}
        </div>
      );
    case constants.edoc.COMPONENT_TYPE_INPUT:
      return (
        <input
          className={`${baseClass} ${selectedClass} border border-gray-400 rounded px-2 py-1`}
          type="text"
          placeholder={component.placeholder || ''}
          readOnly
          onClick={onSelect}
        />
      );
    default:
      return null;
  }
}