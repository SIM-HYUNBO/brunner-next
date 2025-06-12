import React from 'react';
import * as constants from '@/components/constants';

export default function EDocComponentRenderer({ component }) {
  const { runtime_data = {}, templateJson = {} } = component;

  switch (component.type) {
    case constants.edoc.COMPONENT_TYPE_TEXT:
      return (
        <p className="mb-3 whitespace-pre-line">
          {runtime_data.content || ''}
        </p>
      );

    case constants.edoc.COMPONENT_TYPE_TABLE:
      const { data = [[]] } = component.runtime_data || {};

      return (
        <table className="mb-3 border border-gray-300">
          <thead>
            <tr>
              {component.runtime_data?.columns?.map((col, cIdx) => (
                <th key={cIdx} className="border border-gray-300 px-3 py-1 bg-gray-100">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(component.runtime_data?.data || []).map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="border border-gray-300 px-3 py-1 text-center">
                    {cell}
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
          {runtime_data.src ? (
            <img src={runtime_data.src} alt="이미지" className="max-w-full h-auto" />
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
          value={runtime_data.value || ''}
          placeholder={templateJson.placeholder || ''}
          readOnly
        />
      );

    default:
      return null;
  }
}