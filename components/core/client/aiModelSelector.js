import { useEffect, useState } from "react";
import * as constants from "@/components/core/constants";
import { RequestServer } from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { Input, Button, Table } from "antd";
import { currentSystemCode } from "@/components/contents/signinContent";

export default function AIModelSelector({ model, setAIModel, apiKey }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { BrunnerMessageBox, openModal } = useModal();

  const fetchModels = async () => {
    if (!userInfo.isLogin()) {
      openModal(constants.messages.LOGIN_REQUIRED);
      return;
    }

    if (!apiKey) {
      setError("먼저 API Key를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      var jRequest = {};
      var jResponse = null;

      const userId = userInfo.getLoginUserId();
      jRequest.systemCode = currentSystemCode;
      jRequest.commandName = constants.commands.EDOC_AI_GET_MODEL_LIST;
      jRequest.userId = userId;
      jRequest.apiKey = apiKey;

      setLoading(true); // 데이터 로딩 시작
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
      <BrunnerMessageBox />
      <select
        value={model || ""}
        onChange={(e) => setAIModel(e.target.value)}
        onFocus={fetchModels}
        disabled={disabled}
        className={`w-full border p-2 rounded mb-2 ${
          disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
        }`}
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
