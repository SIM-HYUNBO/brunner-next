import React from 'react';
import * as constants from '@/components/constants'

export default function EDocComponentRenderer({ component }) {
  switch (component.type) {
    case constants.edoc.COMPONENT_TYPE_TEXT:
        return (
    <p className="mb-3">
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
        <table className="mb-3 border border-gray-300">
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
        <div className="mb-3">
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
          className="mb-3 border border-gray-400 rounded px-2 py-1"
          type="text"
          placeholder={component.placeholder || ''}
          readOnly
        />
      );
    default:
      return null;
  }
}