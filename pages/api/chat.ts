import { NextApiRequest, NextApiResponse } from 'next';
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { initVectorStore } from '@/config/vectordb';
import { Document } from '@langchain/core/documents';
import { Message } from '@/types/chat';
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getTemplateByContext } from './prompts';

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

// OpenAI 모델 초기화
const model = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// 관련 문서 검색 함수
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
      const searchResults = transformSearchResults(docs);
      return JSON.stringify(searchResults, null, 2);
    }
  },
  async (formattedInput) => {
    // 컨텍스트에 따라 다른 프롬프트 템플릿 사용
    const systemTemplate = getTemplateByContext(formattedInput.context);
    
    const messages = [
      new SystemMessage(systemTemplate),
      new HumanMessage(
        `상황: ${formattedInput.context}\n` +
        `질문: ${formattedInput.message}\n` +
        `대화 기록: ${formattedInput.chat_history}\n` +
        `참고 자료: ${formattedInput.references}`
      )
    ];

    const response = await model.invoke(messages);
    const contentStr = response.content;
    let cleanedStr = '';
    
    try {
      // 파서 : 모든 이중 중괄호를 단일 중괄호로 변환
      cleanedStr = contentStr.toString()
        .replace(/\{\{/g, '{')  // 모든 이중 여는 중괄호를 단일로
        .replace(/\}\}/g, '}')  // 모든 이중 닫는 중괄호를 단일로
        .trim();

      // 파서 : 첫 번째 { 부터 마지막 } 까지만 추출
      const match = cleanedStr.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error('No valid JSON object found');
      }
      cleanedStr = match[0];
      
      console.log('정리된 JSON 문자열:', cleanedStr);
      
      const parsed = JSON.parse(cleanedStr);
      
      if (typeof parsed !== 'object' || !parsed.message) {
        throw new Error('Invalid response structure');
      }

      // 타입 안전성을 위한 인터페이스 추가
      interface Reference {
        title: string;
        description: string;
        source: string;
        url: string;
        imageUrl?: string;
      }

      interface NextCard {
        title: string;
        description: string;
        type: 'action' | 'question';
      }

      return {
        message: parsed.message,
        references: Array.isArray(parsed.references) 
          ? parsed.references.map((ref: Reference | string) => 
              typeof ref === 'string' ? { title: ref } : ref
            )
          : [],
        relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics : [],
        nextCards: Array.isArray(parsed.nextCards)
          ? parsed.nextCards.map((card: NextCard | string) =>
              typeof card === 'string' ? { title: card, type: 'action' } : card
            )
          : []
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

// processAIResponse 함수
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

  try {
    const input = req.body;
    const response = await chain.invoke(input);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('API 오류:', error);
    return res.status(500).json({ error: '오류가 발생했습니다' });
  }
} 