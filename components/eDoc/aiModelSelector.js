import { useEffect, useState } from "react";
import * as constants from "@/components/constants";
import RequestServer from "@/components/requestServer";
import * as userInfo from "@/components/userInfo";

export default function AIModelSelector({ model, setModel, apiKey }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState("");

  const fetchModels = async () => {
    if (!userInfo.isLogin()) {
      openModal(constants.messages.LOGIN_REQUIRED);
      return;
    }

    if (!apiKey) {
      setError("먼저 API Key를 입력해주세요.");
      return;
    }
    if (fetched) return; // 이미 불러온 경우 다시 요청 안 함

    setLoading(true);
    setError("");
      try {
        var jRequest = {};
        var jResponse = null;

        const userId = userInfo.getLoginUserId();
        jRequest.commandName = constants.commands.EDOC_GET_AI_MODEL_LIST;
        jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
        jRequest.userId = userId;
        jRequest.apiKey = apiKey;

        setLoading(true);// 데이터 로딩 시작
        jResponse = await RequestServer(jRequest);
        setModels(jResponse.models);
      } catch (error) {
        console.error("모델 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
  };

  const disabled = !apiKey;

  return (
    <div>
      <select
        value={model || ""}
        onChange={(e) => setModel(e.target.value)}
        onFocus={fetchModels}
        disabled={disabled}
        className={`w-full border p-2 rounded mb-2 ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
      >
        <option value="" disabled>
          {disabled
            ? "API Key를 먼저 입력하세요"
            : loading
            ? "불러오는 중..."
            : "모델을 선택하세요"}
        </option>
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.id}
          </option>
        ))}
      </select>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}