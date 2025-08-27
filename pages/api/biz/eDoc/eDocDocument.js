`use strict`

import logger from "../../winston/logger"
import * as constants from '@/components/constants'
import * as database from "../database/database"
import * as dynamicSql from '../dynamicSql'
import * as commonFunctions from '@/components/commonFunctions'

const executeService = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case constants.commands.EDOC_DOCUMENT_UPSERT_ONE:
                jResponse = await upsertOne(txnId, jRequest);
                break;
            case constants.commands.EDOC_DOCUMENT_SELECT_ONE:
                jResponse = await selectOne(txnId, jRequest);
                break;
            case constants.commands.EDOC_DOCUMENT_DELETE_ONE:
                jResponse = await deleteOne(txnId, jRequest);
                break;
            case constants.commands.EDOC_USER_DOCUMENT_SELECT_ALL: // user all documents
                jResponse = await selectUserAll(txnId, jRequest);
                break;
            case constants.commands.EDOC_ADMIN_DOCUMENT_SELECT_ALL: // admin & public documents
                jResponse = await selectAdminAll(txnId, jRequest);
                break;
            case constants.commands.EDOC_DOCUMENT_AUTO_GENERATE_DOCUMENT:
                jResponse = await generateDocumentWithOpenAI(txnId, jRequest);
              break;
            case constants.commands.EDOC_GET_AI_MODEL_LIST:
              jResponse = await getAIModelList(txnId, jRequest);
              break;
            default:
                break;
        }
    } catch (error) {
        logger.error(`message:${error.message}\n stack:${error.stack}\n`);
    } finally {
        return jResponse;
    }
}


const upsertOne = async (txnId, jRequest) => {
  const jResponse = {};
  let isInsert = null;

  try {
    jResponse.commandName = jRequest.commandName;

    if (!jRequest.documentData) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [documentData]`;
      return jResponse;
    }

    if (!jRequest.documentData.id) {
      jRequest.documentData.id = commonFunctions.generateUUID();

      if (!jRequest.documentData.runtime_data.title) {
        jRequest.documentData.runtime_data.title = "New document";
      }

      if (!jRequest.documentData.runtime_data.description) {
        jRequest.documentData.runtime_data.description = "New document";
      }

      isInsert = true; // insert
    } else {
      isInsert = false; // update
    }

    if (!jRequest.documentData.runtime_data.title) {
      jRequest.documentData.runtime_data.title = constants.messages.EMPTY_STRING;
    }

    // ✅ pages는 필수 JSON
    if (!jRequest.documentData.pages) {
      jRequest.documentData.pages = [];
    }

    if (isInsert) {
      // INSERT
      const sql = await dynamicSql.getSQL00('insert_TB_DOC_DOCUMENT', 1);
      const insertResult = await database.executeSQL(sql, [
        jRequest.systemCode,
        jRequest.documentData.id,
        jRequest.documentData.runtime_data.title,
        jRequest.documentData.runtime_data.description,
        1, // version
        jRequest.userId,
        JSON.stringify(jRequest.documentData.runtime_data || {}),
        JSON.stringify(jRequest.documentData.pages || []),
        jRequest.documentData.runtime_data.menu_path,
      ]);

      if (insertResult.rowCount !== 1) {
        jResponse.error_code = -1;
        jResponse.error_message = constants.messages.FAILED_TO_SAVE_DATA;
        return jResponse;
      }
    } else {
      // UPDATE
      const sql = await dynamicSql.getSQL00('update_TB_DOC_DOCUMENT', 1);
      const updateResult = await database.executeSQL(sql, [
        jRequest.systemCode,
        jRequest.documentData.id,
        jRequest.documentData.runtime_data.title,
        jRequest.documentData.runtime_data.description,
        jRequest.userId,
        JSON.stringify(jRequest.documentData.runtime_data || {}),
        JSON.stringify(jRequest.documentData.pages || []),
        jRequest.documentData.runtime_data.menu_path,
      ]);

      if (updateResult.rowCount !== 1) {
        jResponse.error_code = -1;
        jResponse.error_message = constants.messages.FAILED_TO_SAVE_DATA;
        return jResponse;
      }
    }

    jResponse.error_code = 0;
    jResponse.error_message = constants.messages.SUCCESS_SAVED;
    jResponse.documentData = jRequest.documentData;
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1;
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};


const selectOne = async (txnId, jRequest) => {
  const jResponse = {};

  try {
    jResponse.commandName = jRequest.commandName;

    if (!jRequest.documentId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [documentData.id]`;
      return jResponse;
    }

    // ✅ TB_DOC_DOCUMENT에서 pages 포함 가져오기
    const sql = await dynamicSql.getSQL00('select_TB_DOC_DOCUMENT', 1);
    const select_TB_DOC_DOCUMENT = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.documentId
    ]);

    if (select_TB_DOC_DOCUMENT.rowCount < 1) {
      jResponse.error_code = 0;
      jResponse.error_message = constants.messages.NO_DATA_FOUND;
      return jResponse;
    }

    const row = select_TB_DOC_DOCUMENT.rows[0];

    const documentData = {
      id: row.id,
      runtime_data: row.runtime_data,
      pages: row.pages || [],
    };

    jResponse.documentData = documentData;
    jResponse.error_code = 0;
    jResponse.error_message = constants.messages.EMPTY_STRING;
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1;
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const deleteOne = async (txnId, jRequest) => {
  const jResponse = {};

  try {
    jResponse.commandName = jRequest.commandName;

    if (!jRequest.documentId) {
      jResponse.error_code = -2;
      jResponse.error_message = `${constants.messages.REQUIRED_FIELD} [documentId]`;
      return jResponse;
    }

    // TB_DOC_DOCUMENT 삭제만 수행
    const sql = await dynamicSql.getSQL00('delete_TB_DOC_DOCUMENT', 1);
    const delete_TB_DOC_DOCUMENT = await database.executeSQL(sql, [
      jRequest.systemCode,
      jRequest.documentId
    ]);

    jResponse.error_code = 0;
    jResponse.error_message = constants.messages.SUCCESS_DELETED;
    jResponse.documentData = jRequest.documentData; // optional
  } catch (e) {
    logger.error(e);
    jResponse.error_code = -1;
    jResponse.error_message = e.message;
  } finally {
    return jResponse;
  }
};

const selectUserAll = async (txnId, jRequest) => {
    var jResponse = {};
    
    try {
        jResponse.commanaName = jRequest.commandName;
        
        // select TB_DOC_DOCUMENT
        var sql = null
        sql = await dynamicSql.getSQL00('select_TB_DOC_DOCUMENT', 2);
        var select_TB_DOC_DOCUMENT = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.userId   
            ]);

        jResponse.documentList = select_TB_DOC_DOCUMENT.rows;

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

// 관리자가 작성한 공용문서 전체 목록 조회
const selectAdminAll = async (txnId, jRequest) => {
    var jResponse = {};
    
    try {
        jResponse.commanaName = jRequest.commandName;
        
        // select TB_DOC_DOCUMENT
        var sql = null
        sql = await dynamicSql.getSQL00('select_TB_DOC_DOCUMENT', 3);
        var select_TB_DOC_DOCUMENT = await database.executeSQL(sql,
            [
                jRequest.systemCode,
            ]);

        jResponse.documentList = select_TB_DOC_DOCUMENT.rows;

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

// 관리자가 작성한 공용문서 전체 목록 조회 및 AI 문서 자동 생성
// lib/autoGenerateDocument.js
export const generateDocumentWithOpenAI = async (txnId, jRequest) => {
  let jResponse = {};
  const serverUrl = "https://api.openai.com/v1/chat/completions";

  try {
    const prompt = `
문서 제목: ${jRequest.instructionInfo.title}
지시사항: ${jRequest.instructionInfo.instructions}

아래 지시사항에 따라 답변내용을 문서로 작성하라.
아래 제공되는 JSON 형식으로만 문서를 생성하라. 
필요에 따라 아래 기본 컴포넌트를 사용할 수 있다.

1. 텍스트(text) : 
텍스트로 문장들을 입력하고 단락(문단)을 구성하는 컴포넌트이다. 
이 컴포넌트로 문단내에 여러 문장을 넣을 수 있다. 
컴포넌트 내에서 줄바꿈이 가능하므로 동일 단락이면 한개의 텍스트 컴포넌트를 사용한다.
문장이 여러개라도 불필요하게 여러개의 텍스트 컴포넌트를 사용하지 않는다.
2. 체크리스트(checklist): 
여러 종류의 옵션(보기)이 있고 선택여부 체크를 표현하는 컴포넌트이다.
3. 입력란(input): 
텍스트로 단일 문장을 사용자가 입력할 수 있게 하는 컴포넌트이다.
4. 이미지(image): 
문서에 외부 이미지를 삽입할 필요가 있을때 사용하는 컴포넌트이다.
웹상에 있는 적합한 이미지의 정확한 URL이 확인되는 이미지를 설정하여 문서에서 표시하면 훨씬 유리하다.
이미지 소스가 없거나 제대로 표시할 수 없으면 추가하지 않는다. 
Base64형식으로 전환하여 넣을 수 있다.
5. 버튼(button): 
사용자가 클릭하게 할 수 있고 필요에 따라 외부 Restful API를 호출할 속성값들을 설정하여 호출할 수 있는 컴포넌트이다.
호스트가 127.0.0.1인 url은 사용할 수 없다.
6. 테이블(table): 
문서내에 표를 삽입하고 표 데이터를 구성하고 표시하는 컴포넌트이다.
컬럼 헤더 값들을 설정하고 각 행 데이터 값을 컬럼헤더와 구분해서 입력한다.
표를 그리면서 컬럼 제목은 컬럼제목에만 설정하고 데이터 영역의 첫행에 중복해서 표시하지 않도록 주의한다.
7. 동영상(video) : 
문서에 동영상을 삽입하는 컴포넌트이다. 
웹상에 있는 적합한 동영상의 정확한 URL을 설정하여 문서에서 재생할 수 있게 하면 훨씬 유리하다.
8. 링크 텍스트(linkText)
문서내용과 관련해서 웹상에 있는 적합한 참고할 만한 외부 다른 사이트 페이지로 링크 가능한 텍스트 컴포넌트이다.
해당 페이지의 Url 정보와 문서 제목등 연결될 텍스트 값을 설정해서 링크한다.
외부 페이지를 링크하면 훨씬 유리하다.

JSON 문서 포맷은 아래와 같고 상기 컴포넌트의 기본값을 모두 포함하고 있다.
참고해서 값을 채워서 완성된 문서로 생성한다.
사용하는 모델에 제한이 있으면 자동으로 하위 모델로 선택해서 작업하면 된다.

{
  "id": null,
  "runtime_data": {
    "title": "New Document",
    "description": "신규 전자 문서",
    "isPublic": false,
    "backgroundColor": "#ffffff",
    "padding": 1,
    "menu_path": null
  },
  "pages": [
    {
      "id": "page-1",
      "components": [
        {
          "id": "5e2013b1-7934-4a29-9d16-8da5e5e1b353",
          "name": "체크리스트",
          "type": "checklist",
          "description": "체크리스트",
          "template_json": {
            "type": "checklist",
            "itemCount": 3,
            "textAlign": "left"
          },
          "version": 1,
          "is_active": true,
          "created_at": "2025-06-14T03:54:50.147Z",
          "updated_at": "2025-06-14T03:54:50.147Z",
          "runtime_data": {
            "width": "auto",
            "height": "",
            "forceNewLine": true,
            "itemCount": 3,
            "items": [
              { "label": "항목 1", "checked": false },
              { "label": "항목 2", "checked": false },
              { "label": "항목 3", "checked": false }
            ],
            "positionAlign": "left",
            "fontFamily": "Arial",
            "fontSize": 12,
            "underline": false,
            "fontColor": "#000000",
            "backgroundColor": "#ffffff",
            "fontWeight": "normal"
          }
        },
        {
          "id": "66b2f0cc-8e2f-454f-ac47-dc5703ef5be5",
          "name": "입력란",
          "type": "input",
          "description": "사용자 입력을 받는 필드 컴포넌트",
          "template_json": {
            "type": "input",
            "textAlign": "left",
            "placeholder": "값을 입력하세요"
          },
          "version": 1,
          "is_active": true,
          "created_at": "2025-06-11T23:18:51.489Z",
          "updated_at": "2025-06-11T23:18:51.489Z",
          "runtime_data": {
            "width": "auto",
            "height": "",
            "forceNewLine": true,
            "placeholder": "여기에 값을 입력하세요",
            "textAlign": "left",
            "positionAlign": "left",
            "fontFamily": "Arial",
            "fontSize": 12,
            "underline": false,
            "fontColor": "#000000",
            "backgroundColor": "#ffffff",
            "fontWeight": "normal",
            "editable": true
          }
        },
        {
          "id": "7f05c7a9-0364-4896-9e9e-bc2bbe383cf7",
          "name": "이미지",
          "type": "image",
          "description": "이미지를 삽입할 수 있는 컴포넌트",
          "template_json": { "src": "", "type": "image" },
          "version": 1,
          "is_active": true,
          "created_at": "2025-06-11T23:18:51.950Z",
          "updated_at": "2025-06-11T23:18:51.950Z",
          "runtime_data": {
            "width": "auto",
            "height": "",
            "forceNewLine": true,
            "src": "",
            "positionAlign": "center",
            "fontFamily": "Arial",
            "fontSize": 12,
            "underline": false,
            "fontColor": "#000000",
            "backgroundColor": "#ffffff",
            "fontWeight": "normal"
          }
        },
        {
          "id": "9013173d-645b-4718-8f76-01dc3d252592",
          "name": "텍스트",
          "type": "text",
          "description": "단일 줄 또는 여러 줄 텍스트 컴포넌트",
          "template_json": {
            "type": "text",
            "content": "여기에 내용을 입력하세요.",
            "textAlign": "left"
          },
          "version": 1,
          "is_active": true,
          "created_at": "2025-06-11T23:18:51.722Z",
          "updated_at": "2025-06-11T23:18:51.722Z",
          "runtime_data": {
            "width": "auto",
            "height": "",
            "forceNewLine": true,
            "content": "여기에 텍스트를 설정하세요",
            "textAlign": "left",
            "positionAlign": "left",
            "fontFamily": "Arial",
            "fontSize": 12,
            "underline": false,
            "fontColor": "#000000",
            "backgroundColor": "#ffffff",
            "fontWeight": "normal"
          }
        },
        {
          "id": "a1c2e3f4-5678-1234-9abc-def012345678",
          "name": "링크 텍스트",
          "type": "linkText",
          "description": "외부 사이트 링크 텍스트 컴포넌트 기본 템플릿",
          "template_json": {
            "url": "https://example.com",
            "type": "linkText",
            "content": "링크 텍스트를 입력하세요",
            "fontSize": 12,
            "fontColor": "#1a0dab",
            "textAlign": "left",
            "underline": true,
            "fontFamily": "Arial",
            "fontWeight": "normal",
            "originalWidth": 200,
            "originalHeight": 30,
            "backgroundColor": "transparent"
          },
          "version": 1,
          "is_active": true,
          "created_at": "2025-08-24T02:00:00.000Z",
          "updated_at": "2025-08-24T02:00:00.000Z",
          "runtime_data": {
            "width": "auto",
            "height": "",
            "forceNewLine": true,
            "content": "여기에 링크 텍스트를 설정하세요",
            "url": "https://example.com",
            "textAlign": "left",
            "positionAlign": "left",
            "fontFamily": "Arial",
            "fontSize": 12,
            "underline": true,
            "fontColor": "#1a0dab",
            "backgroundColor": "transparent",
            "fontWeight": "normal"
          }
        },
        {
          "id": "a3f5c6d2-9e8b-4a72-8d92-0b6f2c4a9c13",
          "name": "버튼",
          "type": "button",
          "description": "사용자 요청을 처리하는 버튼 컴포넌트",
          "template_json": {
            "type": "button",
            "padding": "10px 20px",
            "apiMethod": "POST",
            "textColor": "#FFFFFF",
            "buttonText": "버튼",
            "apiEndpoint": "/api/submit",
            "buttonColor": "#4F46E5",
            "borderRadius": "6px"
          },
          "version": 1,
          "is_active": true,
          "created_at": "2025-06-11T23:18:51.489Z",
          "updated_at": "2025-06-11T23:18:51.489Z",
          "runtime_data": {
            "width": "auto",
            "height": "",
            "forceNewLine": true,
            "buttonText": "버튼",
            "apiEndpoint": "",
            "apiMethod": "POST",
            "commandName": "",
            "buttonColor": "#4F46E5",
            "textColor": "#FFFFFF",
            "padding": "10px 20px",
            "borderRadius": "6px"
          }
        },
        {
          "id": "a787f5bf-8166-40c3-be68-457e63cd1767",
          "name": "테이블",
          "type": "table",
          "description": "행과 열이 지정된 기본 테이블 컴포넌트",
          "template_json": { "cols": 3, "rows": 3, "type": "table" },
          "version": 1,
          "is_active": true,
          "created_at": "2025-06-11T23:18:52.178Z",
          "updated_at": "2025-06-11T23:18:52.178Z",
          "runtime_data": {
            "width": "auto",
            "height": "",
            "forceNewLine": true,
            "cols": 3,
            "rows": 3,
            "data": [["", "", ""], ["", "", ""], ["", "", ""]],
            "columns": [
              { "width": "33%", "header": "Header1", "align": "center" },
              { "width": "200px", "header": "Header2", "align": "center" },
              { "width": "auto", "header": "Header3", "align": "center" }
            ],
            "positionAlign": "left",
            "fontFamily": "Arial",
            "fontSize": 12,
            "underline": false,
            "fontColor": "#000000",
            "backgroundColor": "#ffffff",
            "fontWeight": "normal"
          }
        },
        {
          "id": "b2df4fd7-aad2-4554-8bde-db9e22229ec7",
          "name": "동영상",
          "type": "video",
          "description": "영상 컴포넌트 기본 템플릿",
          "template_json": {
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "type": "video",
            "title": "제품 소개 영상",
            "textAlign": "center",
            "originalWidth": 640,
            "originalHeight": 360
          },
          "version": 1,
          "is_active": true,
          "created_at": "2025-07-17T02:54:43.616Z",
          "updated_at": "2025-07-17T02:54:43.616Z",
          "runtime_data": {
            "width": "auto",
            "height": "",
            "forceNewLine": true,
            "url": "",
            "title": "영상 제목",
            "originalWidth": 640,
            "originalHeight": 360
          }
        }
      ],
      "runtime_data": {
        "padding": 24,
        "alignment": "center",
        "backgroundColor": "#ffffff",
        "pageSize": "A4"
      }
    }
  ]
}
- 반드시 JSON만 반환하고, 코드나 주석은 포함하지 않아야 해.
`;

    const temperatureSupportedModels = [
  "gpt-3.5-turbo",
  "gpt-4",
  "gpt-4-turbo",
  "gpt-4o",
  "gpt-4o-mini",
  "GPT-4.1",
  "GPT-4.5",
  "GPT-5",
];

    const bodyPayload = {
      model: jRequest.instructionInfo.aiModel,
      messages: [
        {
          role: "system",
          content: "너는 문서 작성 도우미야. JSON 형식으로만 문서를 만들어야 한다.",
        },
        { role: "user", content: prompt },
      ],
    };

    if (temperatureSupportedModels.includes(jRequest.instructionInfo.aiModel)) {
      bodyPayload.temperature = 0.7;
    }
    
    const aiResponse = await fetch(serverUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jRequest.instructionInfo.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    const resJson = await aiResponse.json();
    const content = resJson.choices?.[0]?.message?.content
      ? resJson.choices[0].message.content
      : "{}";

    if (resJson.error) {
      jResponse = {
        commanaName: jRequest.commandName,
        error_code: -1,
        error_message: `${resJson.error.message}`,
      };
    } else {
      jResponse = {
        commanaName: jRequest.commandName,
        documentData: JSON.parse(content),
        error_code: 0,
        error_message: "",
      };
    }
  } catch (e) {
    jResponse = {
      commanaName: jRequest.commandName,
      error_code: -1,
      error_message: `${e}`,
    };
  }

  return jResponse;
};

export const getAIModelList = async (txnId, jRequest) => {
  let jResponse = {};
  const serverUrl = "https://api.openai.com/v1/models";

  try {
    const aiResponse = await fetch(serverUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jRequest.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`OpenAI API 오류: ${aiResponse.status} - ${errText}`);
    }

    const data = await aiResponse.json();

    jResponse = {
      commandName: jRequest.commandName,
      error_code: 0,
      error_message: "",
      models: data.data.map((m) => ({
        id: m.id,
        created: m.created,
        owned_by: m.owned_by,
      })),
    };
  } catch (e) {
    jResponse = {
      commandName: jRequest.commandName,
      error_code: -1,
      error_message: `${e}`,
      models: [],
    };
  }

  return jResponse;
};


export { executeService };