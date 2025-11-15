import React, { useEffect, useState } from "react";
import { RequestServer } from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import * as constants from "@/components/core/constants";
import Loading from "@/components/core/client/loading";
import { Input, Button, Table } from "antd";

const UserAccountInfo = () => {
  const { BrunnerMessageBox, openModal } = useModal();
  const [searchUserId, setSearchUserId] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin = userInfo.isAdminUser();
  const loginUserId = userInfo.getLoginUserId();

  useEffect(() => {
    if (!isAdmin) {
      // 일반 사용자 → 본인 정보 조회
      setSearchUserId(loginUserId);
      searchUserInfo(userInfo.getCurrentSystemCode(), loginUserId);
    }
  }, []);

  const searchUserInfo = async (systemCode, userId) => {
    if (!userId)
      return await openModal(`${constants.messages.REQUIRED_FIELD} [User id]`);

    try {
      const jRequest = {
        commandName: constants.commands.SECURITY_USER_INFO_SELECT_ONE,
        systemCode,
        userId,
      };

      setLoading(true);
      const jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0) {
        // await openModal(constants.messages.SUCCESS_FINISHED);
        setUserData(jResponse.data.length > 0 ? jResponse.data[0] : null);
      } else {
        await openModal(jResponse.error_message);
        setUserData(null);
      }
    } catch (err) {
      await openModal(err.messages);
    }
    setLoading(false);
  };

  const updateUserAccount = async () => {
    if (!userData) return;

    setSaving(true);
    try {
      const jRequest = {
        commandName: constants.commands.SECURITY_USER_INFO_UPDATE_ONE,
        systemCode: userInfo.getCurrentSystemCode(),
        loginUserId: userInfo.getLoginUserId(),
        userId: userData.user_id,
        userName: userData.user_name,
        address: userData.address,
        phoneNumber: userData.phone_number,
        emailId: userData.email_id,
        expireTime: userData.expire_time,
      };

      const jResponse = await RequestServer(jRequest);
      await openModal(jResponse.error_message);

      if (jResponse.error_code === 0) {
        await searchUserInfo(jRequest.systemCode, userData.user_id);
      }
    } catch (err) {
      await openModal(err);
    }

    setSaving(false);
  };

  // editable 여부 판단 로직
  const isEditable = (key) => {
    if (isAdmin) {
      return key === "expire_time"; // 관리자 → expire_time만 수정 가능
    } else {
      return ["user_name", "address", "phone_number", "email_id"].includes(key);
    }
  };

  const renderField = (key, value) => {
    const labelMap = {
      // user_id: "User Id",
      user_name: "User Name",
      address: "Address",
      phone_number: "Phone No",
      email_id: "E-Mail",
      expire_time: "Expire Date",
    };

    const label = labelMap[key] || key;

    const editable = isEditable(key);

    // expire_time은 date input
    if (key === "expire_time") {
      const dateValue = value ? value.substring(0, 10) : "";
      return (
        <div key={key} className="flex flex-row mt-2">
          <label className="flex w-[100px]">{label}</label>
          <Input
            type="date"
            value={dateValue}
            onChange={(e) =>
              setUserData({ ...userData, expire_time: e.target.value })
            }
            readOnly={!editable}
            className="w-[120px] ml-2"
          />
        </div>
      );
    }

    return (
      key !== "user_id" && (
        <div className="flex flex-row mt-2" key={key}>
          <label className="flex w-[120px]">{label}</label>
          <Input
            className=""
            type="text"
            value={value || ""}
            onChange={(e) =>
              setUserData({ ...userData, [key]: e.target.value })
            }
            readOnly={!editable}
          />
        </div>
      )
    );
  };

  return (
    <>
      {loading && <Loading />}
      <BrunnerMessageBox />
      <div className="ml-5 w-1/2">
        <h2>User Account</h2>

        {/* 사용자 ID 입력 영역 */}
        <div className="flex flex-row mt-5">
          <label className="flex w-[120px]">User ID</label>
          <Input
            className="flex"
            type="text"
            value={searchUserId}
            readOnly={!isAdmin}
            onChange={(e) => setSearchUserId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                searchUserInfo(userInfo.getCurrentSystemCode(), searchUserId);
            }}
          />
          {isAdmin && (
            <Button
              className="flex items-center ml-2"
              onClick={() =>
                searchUserInfo(userInfo.getCurrentSystemCode(), searchUserId)
              }
              disabled={loading}
            >
              Search
            </Button>
          )}
        </div>

        {/* 데이터 표시 */}
        {!loading && userData && (
          <>
            {Object.entries(userData).map(([key, value]) =>
              renderField(key, value)
            )}

            {/* 저장 버튼 */}
            <Button
              onClick={updateUserAccount}
              disabled={saving}
              style={{
                marginTop: 16,
                padding: "10px 16px",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default UserAccountInfo;
