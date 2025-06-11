export default function DocEditorCanvas({ components }) {
  return (
    <div className="min-h-[500px] border border-dashed border-gray-400 bg-white p-4 rounded">
      {components.length === 0 && (
        <p className="text-gray-500 text-center mt-20">좌측에서 컴포넌트를 추가하세요.</p>
      )}
      {components.map((comp, idx) => (
        <DocComponentRenderer key={idx} component={comp} />
      ))}
    </div>
  );
}

function DocComponentRenderer({ component }) {
  switch (component.type) {
    case 'text':
      return <p className="mb-3">{component.content}</p>;
    case 'table':
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
    case 'image':
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
    case 'input':
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