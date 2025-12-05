import { useEffect, useState } from "react";
import * as constants from "@/components/core/constants";
import { RequestServer } from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { Select } from "antd";

export default function AIModelSelector({ model, setAIModel, apiKey }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(constants.General.EmptyString);
  const { BrunnerMessageBox, openModal, openInputModal } = useModal();

  const fetchModels = async () => {
    if (!userInfo.isLogin()) {
      await openModal(constants.messages.LOGIN_REQUIRED);
      return;
    }

    if (!apiKey) {
      setError("먼저 API Key를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(constants.General.EmptyString);
    try {
      const jRequest = {
        systemCode: userInfo.getCurrentSystemCode(),
        commandName: constants.commands.EDOC_AI_GET_MODEL_LIST,
        userId: userInfo.getLoginUserId(),
        apiKey,
      };

      const jResponse = await RequestServer(jRequest);
      setModels(jResponse.models || []);
    } catch (e) {
      console.error("모델 목록 불러오기 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  const disabled = !apiKey;

  return (
    <div>
      <BrunnerMessageBox />

      <Select
        style={{ width: "100%" }}
        value={model || undefined}
        onChange={(value) => setAIModel(value)}
        onDropdownVisibleChange={(open) => {
          if (open) fetchModels();
        }}
        disabled={disabled}
        loading={loading}
        placeholder={
          disabled ? "API Key를 먼저 입력하세요" : "모델을 선택하세요"
        }
        options={models.map((m) => ({
          label: m.id,
          value: m.id,
        }))}
        getPopupContainer={(trigger) => trigger.parentNode} // ← 추가!
      />

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}
