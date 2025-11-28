import { Input, Button, Table } from "antd";

export function FileUploader({ onFileChange, onFileUpload, fileData }) {
  return (
    <div className="border p-4 w-96 rounded-lg general-text-bg-color">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={onFileChange}
        className="mb-2 
        file:border
         file:rounded 
         file:px-3 
         file:py-1 
         file:semi-text-bg-color"
      />

      {fileData?.length > 0 && (
        <div className="semi-text-bg-color p-2 mb-2 max-h-36 overflow-auto rounded">
          <pre className="text-sm">
            {JSON.stringify(fileData.slice(0, 5), null, 2)}
          </pre>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => onFileUpload(fileData)}
          disabled={!fileData || fileData.length === 0}
          className={`px-4 py-2 rounded semi-text-bg-color semi-text-bg-color`}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
