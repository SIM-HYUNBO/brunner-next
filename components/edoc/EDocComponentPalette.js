export default function EDocComponentPalette({ onAddComponent }) {
  const components = [
    { id: 'text', name: '일반 텍스트', type: 'text', content: '새 텍스트' },
    { id: 'table', name: '표 (테이블)', type: 'table', rows: 2, cols: 3 },
    { id: 'image', name: '이미지', type: 'image', src: '' },
    { id: 'input', name: '입력 필드', type: 'input', placeholder: '입력하세요' },
  ];

  return (
    <div className="space-y-3">
      {components.map((comp) => (
        <button
          key={comp.id}
          className="w-full text-left p-2 rounded border border-gray-300 hover:bg-gray-50"
          onClick={() => onAddComponent(comp)}
        >
          {comp.name}
        </button>
      ))}
    </div>
  );
}