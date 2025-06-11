import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
} from "react";
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import RequestServer from "@/components/requestServer";
import { useModal } from "@/components/brunnerMessageBox";

const AutoResizeTextarea = forwardRef(
  ({ name, value, onChange, readOnly }, ref) => {
    const textareaRef = useRef(null);

    // 높이 조정 로직
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto"; // 높이 초기화
        textarea.style.height = `${textarea.scrollHeight + 5}px`; // 내용에 맞게 높이 설정
      }
    }, [value]);

    const handleResizeHeight = useCallback(() => {
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }, []);

    const handleChange = (e) => {
      if (!readOnly) {
        onChange(e); // 값 변경 처리
      }
      handleResizeHeight();
    };

    return (
      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        className={`
          w-full 
          border 
          border-gray-300 
          resize-none 
          rounded-md p-2 mt-1
          ${readOnly ? 
            "dark:bg-slate-800 bg-gray-100 text-slate-400 dark:text-slate-800" : 
            "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-400"
          }
          `
        }
        rows="10"
      />
    );
  }
);

const ServiceSQL = () => {
  // 로딩 & 메시지 박스
  // {
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();

  const editPanelRef = useRef(null); // EditPanel Div 참조
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [queries, setQueries] = useState([]);
  const [sqlInput, setSqlInput] = useState({
    system_code: "",
    sql_name: "",
    sql_seq: "",
    sql_content: "",
  });
  var [currentServiceSQL, setCurrentServiceSQL] = useState(null);

  // Fetch queries from API
  useEffect(() => {
    fetchSQLList();
  }, []);

  var editingServiceSQL;

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    editingServiceSQL = {
      system_code: name === "system_code" ? value : sqlInput.system_code,
      sql_name: name === "sql_name" ? value : sqlInput.sql_name,
      sql_seq: name === "sql_seq" ? value : sqlInput.sql_seq,
      sql_content: name === "sql_content" ? value : sqlInput.sql_content,
    };

    setSqlInput((prevForm) => editingServiceSQL);
  };

  const fetchSQLList = async () => {
    // 관리자 계정인 경우만 조회
    const userId = userInfo.getLoginUserId();
    try {
      const jRequest = {
        commandName: constants.commands.COMMAND_DYNAMIC_SEQ_SELECT_ALL,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userId,
      };

      setLoading(true); // 데이터 로딩 시작
      const jResponse = await RequestServer("POST", jRequest);
      setLoading(false);// 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        setQueries(jResponse.data);
      } else {
        openModal(jResponse.error_message);
      }

      setSqlInput({
        system_code: "",
        sql_name: "",
        sql_seq: "",
        sql_content: "",
      });
      setCurrentServiceSQL(null);
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      setLoading(false); // 데이터 로딩 끝
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  // Handle create or update action
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      var jRequest = {};
      var jResponse = null;

      console.info(
        `${sqlInput.system_code} ${sqlInput.sql_name} ${sqlInput.sql_seq} ${sqlInput.sql_content}`
      );

      jRequest.commandName = constants.commands.COMMAND_DYNAMIC_SEQ_UPDATE_ONE;
      jRequest.systemCode = sqlInput.system_code;
      jRequest.sqlName = sqlInput.sql_name;
      jRequest.sqlSeq = sqlInput.sql_seq;
      jRequest.sqlContent = sqlInput.sql_content;
      jRequest.action = isEditing ? "Update" : isCreating ? "Create" : null;
      jRequest.userId = userInfo.getLoginUserId();

      setLoading(true); // 데이터 로딩 시작
      jResponse = await RequestServer("POST", jRequest);
      setLoading(false); // 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        openModal(constants.messages.MESSAGE_SUCCESS_SAVED);
        fetchSQLList();
      } else openModal(jResponse.error_message);
    } catch (error) {
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  const handleNew = () => {
    setSqlInput({
      system_code: "",
      sql_name: "",
      sql_seq: "",
      sql_content: "",
    });
    setCurrentServiceSQL({
      system_code: "",
      sql_name: "",
      sql_seq: "",
      sql_content: "",
    });
    setIsCreating(true); // 신규 데이터 생성 모드 활성화
  };

  // Handle edit action
  const handleEdit = (userQueryItem) => {
    setSqlInput({
      system_code: userQueryItem.system_code,
      sql_name: userQueryItem.sql_name,
      sql_seq: userQueryItem.sql_seq,
      sql_content: userQueryItem.sql_content,
    });

    setCurrentServiceSQL(userQueryItem);

    setIsEditing(true);

    // 스크롤을 TextArea로 이동
    editPanelRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const ClearInputButton = () => {
    return (
      <button
            onClick={handleNew}
            className={`bg-green-500 
                        text-white 
                        py-2 
                        px-4 
                        rounded-md 
                        hover:bg-green-600 
                        focus:outline-none 
                        focus:ring focus:ring-green-500 
                        focus:ring-opacity-50 
                        ml-2`}
          >
            Clear
          </button>
    )
  }

  const CreateUpdateButton = () =>{
    return (
      <button onClick={handleCreateOrUpdate} 
              className={`bg-blue-500 
                          text-white 
                          py-2 
                          px-4 
                          rounded-md 
                          hover:bg-blue-600 
                          focus:outline-none 
                          focus:ring-2 
                          focus:ring-blue-500 
                          focus:ring-opacity-50`}>
        {currentServiceSQL ? "Update" : "Create"}
      </button>
    )
  }

  // Handle delete action
  const handleDelete = async (userQueryItem) => {
    try {
      const result = await openModal(constants.messages.MESSAGE_DELETE_ITEM);
      if (!result) 
        return;

      var jRequest = {};
      var jResponse = null;

      jRequest.commandName = constants.commands.COMMAND_DYNAMIC_SEQ_DELETE_ONE;
      jRequest.systemCode = userQueryItem.system_code;
      jRequest.sqlName = userQueryItem.sql_name;
      jRequest.sqlSeq = userQueryItem.sql_seq;
      jRequest.userId = userInfo.getLoginUserId();

      setLoading(true); // 데이터 로딩 시작
      jResponse = await RequestServer("POST", jRequest);
      setLoading(false); // 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        openModal(constants.messages.MESSAGE_SUCCESS_DELETED);
        fetchSQLList();
      } else openModal(jResponse.error_message);
    } catch (error) {
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  return (
    <>
      {userInfo?.isAdminUser() && (
        <div className={`p-4`}>
          {loading && (
          <div className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50`}>
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900`}></div>
          </div>
          )}
          <BrunnerMessageBox />
          <h2 className={`text-xl font-bold mb-4`}>Service SQL Management</h2>
          <div ref={editPanelRef} className={`mb-4`}>
            <label className={`block mb-2`}>
              <span className={`text-gray-400`}>System Code:</span>
              <input
                type="text"
                name="system_code"
                value={sqlInput.system_code}
                onChange={handleInputChange}
                readOnly={!isEditing && !isCreating}
                className={`mt-1 block w-full border border-gray-300 text-gray-800 dark:text-gray-400 dark:bg-slate-800 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                required
              />
            </label>
            <label className={`block mb-2`}>
              <span className={`text-gray-400`}>SQL Name:</span>
              <input
                type="text"
                name="sql_name"
                value={sqlInput.sql_name}
                onChange={handleInputChange}
                readOnly={!isEditing && !isCreating}
                className={`mt-1 
                            block 
                            w-full 
                            border 
                            border-gray-300 
                            text-gray-800 
                            dark:text-gray-400 
                            dark:bg-slate-800 
                            rounded-md 
                            shadow-sm 
                            focus:border-blue-500 
                            focus:ring 
                            focus:ring-blue-500 
                            focus:ring-opacity-50`}
                required
              />
            </label>
            <label className={`block mb-2`}>
              <span className={`text-gray-400`}>SQL Sequence:</span>
              <input
                type="text"
                name="sql_seq"
                value={sqlInput.sql_seq}
                onChange={handleInputChange}
                readOnly={!isEditing && !isCreating}
                className={`mt-1 block w-full border border-gray-300 text-gray-800 dark:text-gray-400 dark:bg-slate-800 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                required
              />
            </label>
            <label className={`block mb-4`}>
              <span className={`text-gray-400`}>SQL Content:</span>
              <AutoResizeTextarea
                name="sql_content"
                value={sqlInput.sql_content}
                onChange={handleInputChange}
                readOnly={!isEditing && !isCreating}
              />
            </label>
            <div className={``}>
              <CreateUpdateButton/>
              <ClearInputButton/>
            </div>
          </div>
          <h2 className={`text-lg 
                          font-semibold 
                          mb-4`}>Query List</h2>
          <button
            onClick={fetchSQLList}
            className={`bg-blue-500 
                        text-white 
                        px-4 
                        py-2 
                        rounded-md 
                        hover:bg-blue-600 
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-blue-500 
                        focus:ring-opacity-50 
                        mt-2`}
          >
            Refresh
          </button>
          <table className={`w-full bg-white border border-gray-300 mt-2`}>
            <thead>
              <tr>
                <th className={`border border-gray-300 dark:text-gray-400 dark:bg-slate-800 px-4 py-2`}>
                  System Code
                </th>
                <th className={`border border-gray-300 dark:text-gray-400 dark:bg-slate-800 px-4 py-2`}>
                  SQL Name
                </th>
                <th className={`border border-gray-300  dark:text-gray-400 dark:bg-slate-800 px-4 py-2`}>
                  SQL Sequence
                </th>
                <th className={`border border-gray-300  dark:text-gray-400 dark:bg-slate-800 px-4 py-2`}>
                  SQL Content
                </th>
                <th className={`border border-gray-300 dark:text-gray-400 dark:bg-slate-800 px-4 py-2`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {queries.map((query) => (
                <tr key={query.id}>
                  <td className={`border border-gray-300  dark:text-gray-400 dark:bg-slate-800 px-4 py-2`}>
                    {query.system_code}
                  </td>
                  <td className={`border border-gray-300 dark:text-gray-400 dark:bg-slate-800 px-4 py-2`}>
                    {query.sql_name}
                  </td>
                  <td className={`border border-gray-300 dark:text-gray-400 dark:bg-slate-800 px-4 py-2`}>
                    {query.sql_seq}
                  </td>
                  <td className={`border border-gray-300 dark:text-gray-400 dark:bg-slate-800 px-4 py-2`}>
                    <pre>{query.sql_content}</pre>
                  </td>
                  <td className={`border border-gray-300 dark:text-gray-400 dark:bg-slate-800 px-4 py-2`}>
                    <button
                      onClick={() => handleEdit(query)}
                      className={`bg-yellow-500 
                                  text-white 
                                  px-2 
                                  py-1 
                                  rounded-md 
                                  hover:bg-yellow-600 
                                  focus:outline-none 
                                  focus:ring-2 
                                  focus:ring-yellow-500 
                                  focus:ring-opacity-50`}
                    >
                      Edit SQL    
                    </button>
                    <button
                      onClick={() => handleDelete(query)}
                      className={`bg-red-500 
                                  text-white 
                                  px-2 
                                  py-1 
                                  rounded-md 
                                  hover:bg-red-600 
                                  focus:outline-none 
                                  focus:ring-2 
                                  focus:ring-red-500 
                                  focus:ring-opacity-50`}
                    >
                      Del. SQL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={fetchSQLList}
            className={`bg-blue-500 
                        text-white 
                        px-4 
                        py-2 
                        rounded-md 
                        hover:bg-blue-600 
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-blue-500 
                        focus:ring-opacity-50 
                        mt-2`}
          >
            Refresh
          </button>
        </div>
      )}
    </>
  );
};

export default ServiceSQL;
