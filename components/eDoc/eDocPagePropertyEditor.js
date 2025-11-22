"use strict";

import { Input, Button, Select, Table } from "antd";

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
      <h6 className="text-lg mb-3">Page</h6>

      <label>Padding(px)</label>
      <input
        type="number"
        value={runtimeData.padding ?? 24}
        onChange={(e) =>
          updateProperty("padding", parseInt(e.target.value) ?? 24)
        }
        className="w-full border border-gray-300 rounded p-2 mb-3"
      />

      <label>Page Background Color</label>
      <input
        type="color"
        value={runtimeData.backgroundColor || "#ffffff"}
        onChange={(e) => updateProperty("backgroundColor", e.target.value)}
        className="w-20 h-10 p-1 border border-gray-300 rounded"
      />
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={runtimeData.backgroundColor === "transparent"}
          onChange={(e) =>
            updateProperty(
              "backgroundColor",
              e.target.checked ? "transparent" : "#ffffff"
            )
          }
        />
        Transparent
      </label>

      <label>Page Size</label>
      <Select
        value={runtimeData.pageSize || "A4"}
        onChange={(value) => updateProperty("pageSize", value)}
        className="w-full border border-gray-300 rounded p-2"
      >
        <option value="A4">A4</option>
        <option value="A3">A3</option>
        <option value="Letter">Letter</option>
        <option value="Legal">Legal</option>
      </Select>

      <label>Page Margin (px)</label>
      <input
        type="number"
        min="0"
        value={runtimeData.pageMargin ?? 1}
        onChange={(e) =>
          updateProperty("pageMargin", parseInt(e.target.value) || 1)
        }
        className="w-full border border-gray-300 rounded p-2 mb-3"
      />
    </section>
  );
}
