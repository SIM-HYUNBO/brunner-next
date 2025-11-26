import React, { useEffect, useState } from "react";
import { RequestServer } from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import * as constants from "@/components/core/constants";
import Loading from "@/components/core/client/loading";
import { Input, Button } from "antd";

const UserAccountInfo = () => {
  const { BrunnerMessageBox, openModal, openInputModal } = useModal();
  const [searchUserId, setSearchUserId] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔥 프로필 이미지 신규 추가
  const [profilePreview, setProfilePreview] = useState(null); // 화면 미리보기용
  const [profileFile, setProfileFile] = useState(null); // 서버 전송용

  const isAdmin = userInfo.isAdminUser();
  const loginUserId = userInfo.getLoginUserId();

  useEffect(() => {
    if (!isAdmin) {
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
        const data = jResponse.data.length > 0 ? jResponse.data[0] : null;
        setUserData(data);

        // 🔥 프로필 이미지 미리보기 반영
        if (data?.profile_image_base64) {
          setProfilePreview(data.profile_image_base64);
        } else {
          setProfilePreview(null);
        }
      } else {
        await openModal(jResponse.error_message);
        setUserData(null);
      }
    } catch (e) {
      await openModal(e.messages);
    }

    setLoading(false);
  };

  // 🔥 프로필 이미지 선택 시
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileFile(file);

    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const updateUserAccount = async () => {
    if (!userData) return;

    setSaving(true);
    try {
      // 🔥 프로필 이미지 base64 생성 (파일 업로드 방식이면 multipart로 변경 가능)
      let base64Image = null;
      if (profileFile) {
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(profileFile);
        });
      }

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

        // 🔥 새로 추가된 파라미터
        profileImageBase64: base64Image || userData.profile_image || null,
      };

      const jResponse = await RequestServer(jRequest);
      await openModal(jResponse.error_message);

      if (jResponse.error_code === 0) {
        await searchUserInfo(jRequest.systemCode, userData.user_id);
      }
    } catch (e) {
      await openModal(e);
    }

    setSaving(false);
  };

  const isEditable = (key) => {
    if (isAdmin) {
      return key === "expire_time";
    } else {
      return ["user_name", "address", "phone_number", "email_id"].includes(key);
    }
  };

  const renderField = (key, value) => {
    const labelMap = {
      user_name: "User Name",
      address: "Address",
      phone_number: "Phone No",
      email_id: "E-Mail",
      expire_time: "Expire Date",
    };

    const label = labelMap[key] || key;
    const editable = isEditable(key);

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

        {/* User ID */}
        <div className="flex flex-row mt-5">
          <label className="flex w-[120px]">User ID</label>
          <Input
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
              className="ml-2"
              onClick={() =>
                searchUserInfo(userInfo.getCurrentSystemCode(), searchUserId)
              }
              disabled={loading}
            >
              Search
            </Button>
          )}
        </div>

        {/* 🔥 프로필 사진 업로드 UI */}
        {userData && (
          <div className="mt-5">
            <label className="flex w-[120px] mb-2">Profile Image</label>

            <div className="flex flex-col">
              {/* 미리보기 */}
              {profilePreview && (
                <img
                  src={profilePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded mb-2 border"
                />
              )}

              {/* 파일 업로드 */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        )}

        {/* 기존 데이터 렌더링 */}
        {!loading && userData && (
          <>
            {Object.entries(userData).map(([key, value]) =>
              renderField(key, value)
            )}

            <Button
              onClick={updateUserAccount}
              disabled={saving}
              style={{ marginTop: 16, padding: "10px 16px" }}
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
