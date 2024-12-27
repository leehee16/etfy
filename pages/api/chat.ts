import { NextApiRequest, NextApiResponse } from 'next';
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { Document } from '@langchain/core/documents';
import { Message } from '@/types/chat';
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getTemplateByContext } from './prompts';
import { queryDocuments } from '@/config/vectordb';

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
  modelName: 'gpt-4o',
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
  maxConcurrency: 5,
  maxRetries: 3,
});

// 관련 문서 검색 함수
const retrieveRelatedDocs = async (query: string): Promise<Document[]> => {
  try {
    if (!query) {
      console.error('검색 쿼리가 비어있습니다');
      return [];
    }
    
    console.time('문서 검색 시간');
    const results = await queryDocuments(query);
    console.timeEnd('문서 검색 시간');
    console.log('검색된 문서:', results.length);

    // Document 형식으로 변환
    return results.map(result => new Document({
      pageContent: String(result.metadata?.text || ''),
      metadata: {
        source: String(result.metadata?.source || ''),
        score: result.score
      }
    }));

  } catch (error) {
    console.error('문서 검색 중 오류:', error);
    return [];
  }
};

// 검색 결과를 참조 형식으로 변환하는 함수
const transformSearchResults = (results: Document[]): AIResponse['references'] => {
  console.log('검색 결과 변환 시작...');
  const references = results.map(result => {
    const reference = {
      title: result.metadata?.title || '관련 문서',
      description: result.pageContent,
      source: (result.metadata?.source as string) || '문서 저장소',
      url: (result.metadata?.url as string) || undefined,
      imageUrl: (result.metadata?.imageUrl as string) || undefined,
      timestamp: new Date().toISOString(),
      query: result.metadata?.query || ''
    };
    console.log('변환된 참조:', reference);
    return reference;
  });
  console.log('변환된 참조 수:', references.length);
  return references;
};

// 체인 정의
const chain = RunnableSequence.from([
  {
    context: (input: ChatRequest) => input.context || '',
    message: (input: ChatRequest) => input.message,
    chat_history: (input: ChatRequest) => input.chat_history || '',
    references: async (input: ChatRequest) => {
      console.time('참조 문서 처리 시간');
      const docs = await retrieveRelatedDocs(input.message);
      const searchResults = transformSearchResults(docs);
      const result = JSON.stringify(searchResults, null, 2);
      console.timeEnd('참조 문서 처리 시간');
      return result;
    }
  },
  async (formattedInput) => {
    // 컨텍스트에 따라 다른 프롬프트 템플릿 사용
    console.time('프롬프트 생성 시간');
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
    console.timeEnd('프롬프트 생성 시간');

    // GPT 응답 생성
    console.time('GPT 응답 시간');
    const response = await model.invoke(messages);
    console.timeEnd('GPT 응답 시간');

    console.time('응답 파싱 시간');
    const contentStr = response.content;
    let cleanedStr = '';
    
    try {
      // 파서 최적화: 한 번의 정규식으로 처리
      cleanedStr = contentStr.toString()
        .replace(/\{+/g, '{')
        .replace(/\}+/g, '}')
        .trim();

      const match = cleanedStr.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error('No valid JSON object found');
      }
      cleanedStr = match[0];
      
      const parsed = JSON.parse(cleanedStr);
      console.timeEnd('응답 파싱 시간');
      
      if (typeof parsed !== 'object' || !parsed.message) {
        throw new Error('Invalid response structure');
      }

      return {
        message: parsed.message,
        references: Array.isArray(parsed.references) 
          ? parsed.references.map((ref: any) => 
              typeof ref === 'string' ? { title: ref } : ref
            )
          : [],
        relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics : [],
        nextCards: Array.isArray(parsed.nextCards)
          ? parsed.nextCards.map((card: any) =>
              typeof card === 'string' ? { title: card, type: 'action' } : card
            )
          : []
      };
    } catch (error) {
      console.error('응답 파싱 실패:', error);
      console.timeEnd('응답 파싱 시간');
      
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