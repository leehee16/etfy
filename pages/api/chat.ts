import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { initVectorStore } from '@/config/vectordb';
import { Document } from '@langchain/core/documents';
import { Message } from '@/types/chat';  // Message 타입 임포트

// 응답 타입 정의
interface AIResponse {
  content: string;
  references: Array<{
    title: string;
    description: string;
    source: string;
    url?: string;
    imageUrl?: string;
  }>;
  relatedTopics: string[];
  nextCards: NextCard[];
}

interface NextCard {
  title: string;
  description: string;
  type: 'action' | 'question';
}

// ChatRequest 인터페이스 정의
interface ChatRequest {
  context?: string;
  message: string;
  messages?: Message[];
  chat_history?: string;
  references?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const chatModel = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

const systemTemplate = `당신은 ETF 전문가이자 ETF교육을 담당하고 있습니다.  
초보 투자자를 위해 친절하고 이해하기 쉽게 정보를 제공하는 것이 목표입니다.  
검색된 정보(retrieved context)를 적극적으로 활용하고, 이를 바탕으로 정확하고 신뢰할 수 있는 답변을 작성하세요.  
다음 JSON 형식을 정확히 따르세요:

{{
  "message": "사용자 질문에 대한 상세하고 친절한 답변을 작성합니다. 검색된 정보와 자체 지식을 바탕으로 명확하고 간결하게 작성하세요.",
  "references": [
    {{
      "title": "참고자료 제목",
      "description": "참고자료에 대한 간단하면서 초보자가 이해하기 쉽게 설명",
      "source": "출처 (예: 금융감독원, 한국거래소 등)",
      "url": "https://example.com",
      "imageUrl": "https://example.com/image.jpg"
    }}
  ],
  "relatedTopics": [
    "검색된 정보와 관련된 주제 1",
    "검색된 정보와 관련된 주제 2",
    "검색된 정보와 관련된 주제 3"
  ],
  "nextCards": [
    {{
      "title": "다음 단계로 추천하는 주제",
      "description": "검색 결과를 기반으로 배울 수 있는 점을 초보자 관점에서 설명합니다.",
      "type": "action"
    }},
    {{
      "title": "추가로 물어보면 좋을 질문",
      "description": "검색된 정보와 관련하여 더 깊이 알아볼 수 있는 질문을 작성합니다.",
      "type": "question"
    }}
  ]
}}

응답 규칙:  
1. 반드시 검색된 정보(retrieved context)를 응답에 반영할 것.  
2. **message**는 검색된 자료와 자체 지식을 결합해 초보 투자자에게 친절하고 이해하기 쉬운 문구로 작성(UX Writing).  
3. **references**는 검색된 정보에서 적합한 자료를 참조하며, 출처를 명확히 표시.  
4. **relatedTopics**는 검색된 자료를 기반으로 초보자가 추가 학습할 주제를 포함.  
5. **nextCards**는 검색 결과와 초보 투자 여정을 고려한 행동(action)과 질문(question) 형식으로 작성.  
6. 검색된 정보가 부족하거나 불완전할 경우, 신뢰할 수 있는 기본 지식과 실질적 예시를 포함하여 보완.  
7. 모든 설명은 초보자가 자주 묻는 질문을 반영하며 UX 라이팅 스타일로 간결하고 친절하게 작성.  
8. 아래와 같은 예상 출력 예시를 참고하여 JSON 형식으로 정확히 작성.

---

### 출력 예시

{{
  "message": "ETF는 여러 회사 주식을 한 바구니에 담아 한 번에 사는 것과 비슷한 투자 상품이에요. 한 회사를 잘못 골라도 다른 회사들이 받쳐주기 때문에 손해를 줄일 수 있어요. 예를 들어 S&P 500 ETF를 사면 미국의 큰 회사 500개를 한 번에 투자하는 셈이라 여러 회사를 하나씩 고를 필요가 없어요. 또 주식을 직접 하나씩 사는 것보다 비용이 낮고 사고팔기도 쉬워서, 처음 투자하는 사람에게 좋은 출발점이 돼요.",
  "references": [
    {{
      "title": "ETF란 무엇인가?",
      "description": "ETF의 정의와 기본적인 특징, 초보자를 위한 투자 가이드를 담은 자료에요.",
      "source": "한국거래소",
      "url": "https://example.com/etf",
      "imageUrl": "https://example.com/etf_image.jpg"
    }}
  ],
  "relatedTopics": [
    "ETF와 펀드의 차이점",
    "S&P 500 ETF와 국내 ETF 비교",
    "ETF를 활용한 분산 투자 방법"
  ],
  "nextCards": [
    {{
      "title": "분산 투자의 장점 알아보기",
      "description": "ETF를 활용한 분산 투자 방법과 그 효과를 쉽게 이해할 수 있는 자료를 추천해요.",
      "type": "action"
    }},
    {{
      "title": "ETF 투자 시 수수료는 어떻게 되나요?",
      "description": "ETF 수수료 구조와 투자 전략에 수수료를 반영하는 방법에 대해 알아보세요.",
      "type": "question"
    }}
  ]
}}`;

const humanTemplate = "상황: {context}\n질문: {question}";

// 채팅 기록 포맷팅 함수 수정
const formatChatHistory = (messages: Message[] = []): string => {
  if (!Array.isArray(messages)) {
    console.warn('messages is not an array:', messages);
    return '';
  }

  return messages
    .filter(msg => msg && typeof msg.content === 'string')
    .map(msg => {
      const role = msg.role === 'user' ? 'Human' : 'Assistant';
      return `${role}: ${msg.content}`;
    })
    .join('\n');
};

// 프롬프트 템플릿 설정
const chatPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(systemTemplate),
  HumanMessagePromptTemplate.fromTemplate("상황: {context}\n질문: {message}\n대화 기록: {chat_history}\n참고 자료: {references}")
]);

// OpenAI 모델 초기화
const model = new ChatOpenAI({
  modelName: 'gpt-4-turbo-preview', // 또는 'gpt-3.5-turbo'
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// 관련 문서 검색 함수 수정
const retrieveRelatedDocs = async (query: string): Promise<Document[]> => {
  try {
    if (!query) {
      console.error('검색 쿼리가 비어있습니다');
      return [];
    }
    
    const vectorStore = await initVectorStore();
    if (!vectorStore) {
      console.error('벡터 스토어 초기화 실패');
      return [];
    }

    const docs = await vectorStore.similaritySearch(query.trim(), 3);
    return docs;
  } catch (error) {
    console.error('문서 검색 중 오류:', error);
    return [];
  }
};

// 검색 결과를 참조 형식으로 변환하는 함수
const transformSearchResults = (results: Document[]): AIResponse['references'] => {
  return results.map(result => ({
    title: result.metadata?.title || '관련 문서',
    description: result.pageContent,
    source: (result.metadata?.source as string) || '문서 저장소',
    url: (result.metadata?.url as string) || undefined,
    imageUrl: (result.metadata?.imageUrl as string) || undefined,
    timestamp: new Date().toISOString(), // 검색 시점 추가
    query: result.metadata?.query || '' // 검색 쿼리 추가
  }));
};

// 체인 정의
const chain = RunnableSequence.from([
  {
    context: (input: ChatRequest) => input.context || '',
    message: (input: ChatRequest) => input.message,
    chat_history: (input: ChatRequest) => input.chat_history || '',
    references: async (input: ChatRequest) => {
      const docs = await retrieveRelatedDocs(input.message);
      // 검색 결과에 현재 쿼리 정보 추가
      docs.forEach(doc => {
        doc.metadata = {
          ...doc.metadata,
          query: input.message,
          timestamp: new Date().toISOString()
        };
      });
      const searchResults = transformSearchResults(docs);
      return JSON.stringify(searchResults, null, 2);
    }
  },
  chatPrompt,
  chatModel,
  (response) => {
    console.log('AI 응답 원본:', response);

    try {
      if (typeof response === 'string') {
        const parsed = JSON.parse(response);
        return {
          ...parsed,
          references: JSON.parse(parsed.references || '[]')
        };
      }
      
      if (response.content) {
        try {
          const parsed = JSON.parse(response.content);
          console.log('파싱된 응답:', parsed);
          return parsed;
        } catch (e) {
          console.log('JSON 파싱 실패, 기본 형식으로 변환');
          return {
            message: response.content,
            references: [],
            relatedTopics: [],
            nextCards: []
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error('응답 변환 중 오류:', error);
      throw error;
    }
  }
]);

// 응답 처리 함수 수정
const processAIResponse = (response: any) => {
  console.log('processAIResponse 입력:', response); // 디버깅용
  
  try {
    // 문자열이면 JSON으로 파싱
    const parsedResponse = typeof response === 'string' 
      ? JSON.parse(response) 
      : response;

    console.log('처리된 응답:', parsedResponse); // 디버깅용

    // 응답 형식 확인 및 변환
    if (!parsedResponse.message && !parsedResponse.content) {
      console.log('message/content 필드 없음:', parsedResponse); // 디버깅용
      throw new Error('응답에 message/content 필드가 없습니다');
    }

    const result = {
      role: 'assistant',
      content: parsedResponse.message || parsedResponse.content,
      references: parsedResponse.references || [],
      relatedTopics: parsedResponse.relatedTopics || [],
      nextCards: parsedResponse.nextCards || []
    };

    console.log('최종 응답:', result); // 디버깅용
    return result;
  } catch (error) {
    console.error('응답 처리 중 오류:', error);
    throw new Error('Invalid response format');
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // SSE 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const input = req.body;
    
    // 스트리밍 응답을 위한 설정
    const stream = await chain.stream(input);

    // 청크로 응답 전송
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('API 오류:', error);
    res.write(`data: ${JSON.stringify({ error: '오류가 발생했습니다' })}\n\n`);
    res.end();
  }
} 