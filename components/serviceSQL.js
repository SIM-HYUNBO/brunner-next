import React, { useState, useRef, useEffect } from 'react';
import * as Constants from '@/components/constants';
import * as userInfo from '@/components/userInfo';
import requestServer from '@/components/requestServer';
import BrunnerMessageBox from '@/components/BrunnerMessageBox';

const AutoResizeTextarea = ({ value, onChange, readOnly }) => {
    const textareaRef = useRef(null);

    // 높이 조정 로직
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // 높이 초기화
            textarea.style.height = `${textarea.scrollHeight}px`; // 내용에 맞게 높이 설정
        }
    }, [value]);

    const handleChange = (e) => {
        if (!readOnly) {
            onChange(e); // 값 변경 처리
        }
    };

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            readOnly={readOnly}
            className={`resize-none w-full border border-gray-300 rounded-md p-2 mt-1 ${readOnly ? 'bg-gray-100' : ''}`}
            rows="1"
        />
    );
};

const ServiceSQL = () => {
    const [modalContent, setModalContent] = useState({
        isOpen: false,
        message: '',
        onConfirm: () => { },
        onClose: () => { }
    });
    const [loading, setLoading] = useState(false); // 로딩 상태 추가

    // 모달 열기 함수
    const openModal = (message) => {
        return new Promise((resolve, reject) => {
            setModalContent({
                isOpen: true,
                message: message,
                onConfirm: () => { resolve(); closeModal(); },
                onClose: () => { reject(); closeModal(); }
            });
        });
    };

    // 모달 닫기 함수
    const closeModal = () => {
        setModalContent({
            isOpen: false,
            message: '',
            onConfirm: () => { },
            onClose: () => { }
        });
    };

    const [queries, setQueries] = useState([]);
    const [form, setForm] = useState({
        system_code: '',
        sql_name: '',
        sql_seq: '',
        sql_content: ''
    });
    const [currentServiceSQL, setCurrentServiceSQL] = useState(null);

    // Fetch queries from API
    useEffect(() => {
        fetchServiceSQLs();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        setForm((prevForm) => ({
            ...prevForm,
            'system_code': currentServiceSQL.system_code,
            'sql_name': currentServiceSQL.sql_name,
            'sql_seq': currentServiceSQL.sql_seq,
            'sql_content': e.target.value
        }));
    };

    const fetchServiceSQLs = async () => {
        // 관리자 계정인 경우만 조회
        const userId = userInfo.getLoginUserId();
        // if (!userId) return;

        try {
            const jRequest = {
                commandName: Constants.COMMAND_SERVICESQL_GET_ALL_SQL,
                systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
                userId: userId
            };

            setLoading(true); // 데이터 로딩 시작    
            const jResponse = await requestServer('POST', JSON.stringify(jRequest));
            setLoading(false);

            if (jResponse.error_code === 0) {
                setQueries(jResponse.data);
            } else {
                openModal(jResponse.error_message);
            }
        } catch (error) {
            setLoading(false); // 데이터 로딩 끝
            openModal(error.toString());
        }
    };

    // Handle create or update action
    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            var jRequest = {};
            var jResponse = null;

            console.info(`${form.system_code} ${form.sql_name} ${form.sql_seq} ${form.sql_content}`);

            jRequest.commandName = Constants.COMMAND_SERVICESQL_UPDATE_SERVICE_SQL;
            jRequest.systemCode = currentServiceSQL.system_code;
            jRequest.sqlName = currentServiceSQL.sql_name;
            jRequest.sqlSeq = currentServiceSQL.sql_seq;
            jRequest.sqlContent = form.sql_content;
            jRequest.action = currentServiceSQL ? 'Update' : 'Create';
            jRequest.userId = userInfo.getLoginUserId();

            setLoading(true); // 데이터 로딩 시작
            jResponse = await requestServer('POST', JSON.stringify(jRequest));
            setLoading(false); // 데이터 로딩 끝

            if (jResponse.error_code === 0) {
                openModal(Constants.MESSAGE_SUCCESS_SAVED);

                setForm({
                    system_code: '',
                    sql_name: '',
                    sql_seq: '',
                    sql_content: ''
                });
                setCurrentServiceSQL(null);
                fetchServiceSQLs()
            }
            else
                openModal(jResponse.error_message);

        } catch (error) {
            openModal(error);
        }
    };

    // Handle edit action
    const handleEdit = (userQueryItem) => {
        setForm({
            system_code: userQueryItem.system_code,
            sql_name: userQueryItem.sql_name,
            sql_seq: userQueryItem.sql_seq,
            sql_content: userQueryItem.sql_content
        });

        setCurrentServiceSQL(userQueryItem);
    };

    // Handle delete action
    const handleDelete = async (id) => {
        try {
            // await axios.delete(`/api/queries/${id}`);
            // Refresh the list
            const response = await axios.get('/api/queries');
            setQueries(response.data);
        } catch (error) {
            console.error('Failed to delete query:', error);
        }
    };

    return (
        <>
            {userInfo?.isAdminUser() && <div className="p-4">
                <BrunnerMessageBox
                    isOpen={modalContent.isOpen}
                    message={modalContent.message}
                    onConfirm={modalContent.onConfirm}
                    onClose={modalContent.onClose}
                />

                <h1 className="text-xl font-bold mb-4">Service SQL Management</h1>
                <div className="mb-4">
                    <label className="block mb-2">
                        <span className="text-gray-700">System Code:</span>
                        <input
                            type="text"
                            name="system_code"
                            value={form.system_code}
                            readOnly
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            required
                        />
                    </label>
                    <label className="block mb-2">
                        <span className="text-gray-700">SQL Name:</span>
                        <input
                            type="text"
                            name="sql_name"
                            value={form.sql_name}
                            readOnly
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            required
                        />
                    </label>
                    <label className="block mb-2">
                        <span className="text-gray-700">SQL Sequence:</span>
                        <input
                            type="text"
                            name="sql_seq"
                            value={form.sql_seq}
                            readOnly
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            required
                        />
                    </label>
                    <label className="block mb-4">
                        <span className="text-gray-700">SQL Content:</span>
                        <AutoResizeTextarea
                            value={form.sql_content}
                            onChange={handleInputChange}
                            readOnly={currentServiceSQL === null}
                        />
                    </label>
                    <button
                        onClick={handleCreateOrUpdate}
                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        {currentServiceSQL ? 'Update' : 'Create'}
                    </button>
                </div>

                <h2 className="text-lg font-semibold mb-4">Query List</h2>

                <button
                    onClick={fetchServiceSQLs}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mt-2"
                >
                    Refresh
                </button>
                <table className="w-full bg-white border border-gray-300 mt-2">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">System Code</th>
                            <th className="border border-gray-300 px-4 py-2">SQL Name</th>
                            <th className="border border-gray-300 px-4 py-2">SQL Sequence</th>
                            <th className="border border-gray-300 px-4 py-2">SQL Content</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queries.map((query) => (
                            <tr key={query.id}>
                                <td className="border border-gray-300 px-4 py-2">{query.system_code}</td>
                                <td className="border border-gray-300 px-4 py-2">{query.sql_name}</td>
                                <td className="border border-gray-300 px-4 py-2">{query.sql_seq}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <pre>{query.sql_content}</pre>
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <button
                                        onClick={() => handleEdit(query)}
                                        className="bg-yellow-500 text-white py-1 px-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(query.id)}
                                        className="bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ml-2"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    onClick={fetchServiceSQLs}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mt-2"
                >
                    Refresh
                </button>
            </div>
            }
        </>
    );
};

export default ServiceSQL;
