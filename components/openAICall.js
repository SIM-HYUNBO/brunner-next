
export const getAIModelList = async (apiKey) => {
  const serverUrl = "https://api.openai.com/v1/models";

  try {
    const aiResponse = await fetch(serverUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`OpenAI API 오류: ${aiResponse.status} - ${errText}`);
    }

    const data = await aiResponse.json();
    return data.data.map((m) => ({
        id: m.id,
        created: m.created,
        owned_by: m.owned_by,
      }));
  } catch (e) {
    jResponse = {
      commandName: jRequest.commandName,
      error_code: -1,
      error_message: `${e}`,
      models: [],
    };
  }

  return null;
};

/* prompts는 아래와 같은 구조의 JsonObject 배열입니다.
   prompts: [
     {
       role: "system",
       content: "모델의 행동이나 응답 방식, 방향성 등을 설정하는 역할",
     },
     { 
       role: "user", 
       content: "모델과 직접 상호작용하는 사용자의 상세 요청 내용" 
     },
]

Open AI API에서 prompt는 특정한 역할을 수행하는 여러 요소로 구성됩니다. 
그 중 'role'은 메시지의 유형을 정의하여 모델이 어떻게 응답해야 할지를 안내합니다. 
주로 사용되는 role에는 'system'과 'user', 'assistant'가 있습니다.

'system' role은 모델에게 특정한 지침이나 규칙을 제공하여, 모델이 사용자에게 제공할 응답의 방향성을 설정합니다. 
반면 'user' role은 실제 사용자로서 모델과 상호작용하며 질문이나 요청을 전달합니다. 

이렇듯 두 role은 서로 다른 기능을 수행하며, 효과적인 대화 생성에 기여합니다.

Open AI API에서 사용되는 role의 종류는 다음과 같습니다:
1. system: 모델의 행동이나 응답 방식을 설정하는 역할
2. user: 모델과 직접 상호작용하는 사용자 역할
3. assistant: 모델의 보조 역할로, 사용자 요청에 대한 응답을 지원하는 역할

*/

export const requestPrompt = async (apiKey, 
                                    aiModel, 
                                    systemPrompt, 
                                    userPrompt, 
                                    assistantPrompt) => {
    var result = {
        errror_code: -1,
        error_message: '',
        aiResultData : ''
    };

    const serverUrl = "https://api.openai.com/v1/chat/completions";

  try {

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

    const prompts =
    [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", 
        content: userPrompt 
      },
      { role: "assistant", 
        content: assistantPrompt 
      },

    ];


    const bodyPayload = {
      model: aiModel,
      messages: prompts,
    };

    if (temperatureSupportedModels.includes(aiModel)) {
      bodyPayload.temperature = 0.7;
    }
    
    const aiResponse = await fetch(serverUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    const resJson = await aiResponse.json();
    const content = resJson.choices?.[0]?.message?.content
      ? resJson.choices[0].message.content
      : "{}";

    if (resJson.error) {
        result = {
        error_code: -1,
        error_message: resJson.error,
        aiResultData : null
        }
    }
    else {
        result = {
        error_code: 0,
        error_message: null,
        aiResultData : JSON.parse(content)
        }
    }
} catch (e) {
    result = {
      error_code: -1,
      error_message: `${e}`,
      aiResultData : null
    };
  }

  return result;
};