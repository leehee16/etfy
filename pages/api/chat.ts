import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { initVectorStore } from '@/config/vectordb';
import { Document } from '@langchain/core/documents';
import { Message } from '@/types/chat';  // Message 타입 임포트
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

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


const chatModel = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
});

const systemTemplate = `당신은 ETF 전문가이자 ETF교육을 담당하고 있습니다.  
초보 투자자를 위해 친절하고 이해하기 쉽게 정보를 제공하는 것이 목표입니다.  
검색된 정보(retrieved context)를 적극적으로 활용하고, 이를 바탕으로 정확하고 신뢰할 수 있는 답변을 작성하세요.  
다음 JSON 형식을 정확히 따르세요:

{{
  "message": "사용자 질문에 대한 상세하고 친절한 답변을 작성합니다. 검색된 정보와 자체 지식을 바탕으로 명확하게 작성하세요. 이모티콘도 넣고 항목별로 나누서 보기 적확하게 작성해주세요.
<예시>
🪙 ETF란?
ETF(Exchange Traded Fund)는 **"상장지수펀드"**라는 뜻이에요. 주식시장에 상장되어 있어 주식처럼 사고팔 수 있는 펀드 상품이에요.

📈 ETF의 특징
주식처럼 거래:
🛒 주식시장에서 자유롭게 사고팔 수 있어요.
💰 실시간으로 가격이 변동해요.

분산 투자:
🧺 여러 주식, 채권, 자산에 분산 투자할 수 있어 리스크를 줄여요.
예: 삼성전자, 현대차 등 여러 기업에 한 번에 투자 가능.

운용 비용 저렴:
💸 펀드보다 관리비용(수수료)이 낮아요.

🧩 ETF의 종류
📊 지수형 ETF:
특정 주가지수를 따라가요.
예: 코스피200 ETF → 코스피200 지수를 추종.

🌱 섹터 ETF:
특정 산업 분야에 집중 투자.
예: 바이오, IT, 에너지 ETF.

🌍 해외 ETF:
해외 주식이나 지수에 투자.
예: 미국 S&P500 ETF.

💎 원자재 ETF:
금, 은, 원유 등 원자재에 투자.
예: 금 ETF, 석유 ETF.
</예시>
",
  "references": [
    {{
      "title": "참고자료 제목",
      "description": "참고자료에 대한 간단하면서 초보자가 이해하기 쉽게 설명",
      "source": "출처 (예: 금융감독원, 한국거래소 등)",
      "url": "https://example.com",
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

// 체인 정의 수정
const chain = RunnableSequence.from([
  {
    context: (input: ChatRequest) => input.context || '',
    message: (input: ChatRequest) => input.message,
    chat_history: (input: ChatRequest) => input.chat_history || '',
    references: async (input: ChatRequest) => {
      const docs = await retrieveRelatedDocs(input.message);
      const searchResults = transformSearchResults(docs);
      return JSON.stringify(searchResults, null, 2);
    }
  },
  async (formattedInput) => {
    const messages = [
      new SystemMessage(systemTemplate),
      new HumanMessage(
        `상황: ${formattedInput.context}\n` +
        `질문: ${formattedInput.message}\n` +
        `대화 기록: ${formattedInput.chat_history}\n` +
        `참고 자료: ${formattedInput.references}`
      )
    ];

    const response = await chatModel.invoke(messages);
    const contentStr = response.content;
    let cleanedStr = '';
    
    try {
      cleanedStr = contentStr
        .replace(/^\s*\{{2,}/, '{')
        .replace(/\}{2,}\s*$/, '}')
        .replace(/\{{2,}/g, '{')
        .replace(/\}{2,}/g, '}')
        .replace(/\s+/g, ' ')
        .trim();

      console.log('정리된 JSON 문자열:', cleanedStr);
      
      if (!cleanedStr.startsWith('{') || !cleanedStr.endsWith('}')) {
        throw new Error('Invalid JSON format');
      }
      
      const parsed = JSON.parse(cleanedStr);
      
      if (typeof parsed !== 'object' || !parsed.message) {
        throw new Error('Invalid response structure');
      }

      return {
        message: parsed.message,
        references: Array.isArray(parsed.references) ? parsed.references : [],
        relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics : [],
        nextCards: Array.isArray(parsed.nextCards) ? parsed.nextCards : []
      };
    } catch (error) {
      console.error('응답 파싱 실패:', error);
      console.log('원본 응답:', contentStr);
      console.log('정리 시도한 문자열:', cleanedStr);
      
      return {
        message: '죄송합니다. 응답을 처리하는 중에 오류가 발생했습니다.',
        references: [],
        relatedTopics: [],
        nextCards: []
      };
    }
  }
]);

// processAIResponse 함수도 더 안정적으로 수정
const processAIResponse = (response: any) => {
  console.log('processAIResponse 입력:', response);
  
  try {
    // 이미 객체인 경우 그대로 사용
    const parsedResponse = typeof response === 'string' 
      ? JSON.parse(response) 
      : response;

    // 응답 구조 정규화
    return {
      role: 'assistant',
      content: parsedResponse.message || parsedResponse.content || '',
      references: Array.isArray(parsedResponse.references) ? parsedResponse.references : [],
      relatedTopics: Array.isArray(parsedResponse.relatedTopics) ? parsedResponse.relatedTopics : [],
      nextCards: Array.isArray(parsedResponse.nextCards) ? parsedResponse.nextCards : []
    };
  } catch (error) {
    console.error('응답 처리 중 오류:', error);
    // 에러 발생 시 기본 응답 구조 반환
    return {
      role: 'assistant',
      content: String(response),
      references: [],
      relatedTopics: [],
      nextCards: []
    };
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