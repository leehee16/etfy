import { NextApiRequest, NextApiResponse } from 'next';
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { Document } from '@langchain/core/documents';
import { Message } from '@/types/chat';
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { getTemplateByContext } from './prompts';
import { queryDocuments } from '@/config/vectordb';
import { BufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/memory";

// 메모리 초기화
const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
  inputKey: "input",
});

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
  messageId: string;  // 추가: 메시지 ID
  parentMessageId?: string;  // 추가: 부모 메시지 ID
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
  selectedSectors?: Array<{
    id: string;
    name: string;
    change: number;
    checked: boolean;
    etfs: Array<{
      name: string;
      code: string;
      change: number;
    }>;
  }>;
  selectedTexts?: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
  }>;
  currentStep?: {
    id: number;
    title: string;
    description: string;
    progress: number;
    subTasks: Array<{
      id: string;
      title: string;
      description: string;
      completed: boolean;
      weight: number;
    }>;
  };
  selectedETFs?: Array<{
    name: string;
    code: string;
    purchasePrice: number;
    currentPrice: number;
    change: number;
    amount: number;
  }>;
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
  maxRetries: 2,
  timeout: 30000,  // 30초 타임아웃 설정
});

// 관련 문서 검색 함수
const retrieveRelatedDocs = async (query: string): Promise<Document[]> => {
  try {
    if (!query) {
      console.error('검색 쿼리가 비어있습니다');
      return [];
    }
    
    const results = await queryDocuments(query, 3);  // 검색 결과 수 제한

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
  async (input: ChatRequest) => {
    // 병렬로 처리할 작업들을 정의
    const [
      context,
      message,
      chatHistory,
      references,
      contextInfo
    ] = await Promise.all([
      Promise.resolve(input.context || ''),
      Promise.resolve(input.message),
      Promise.resolve().then(() => {
        const recentMessages = input.messages ? 
          input.messages.slice(-8) : 
          [];
        return formatChatHistory(recentMessages);
      }),
      retrieveRelatedDocs(input.message).then(docs => {
        const searchResults = transformSearchResults(docs);
        return JSON.stringify(searchResults);
      }),
      Promise.resolve().then(() => {
        const info = [];
        
        // 기초공부하기 컨텍스트의 선택된 텍스트
        if (input.context === '기초공부하기' && input.selectedTexts?.length > 0) {
          info.push(`선택된 학습 내용:\n${input.selectedTexts
            .filter(text => text.completed)
            .map(text => `- ${text.title}: ${text.description}`)
            .join('\n')}`);
        }
        
        // 투자시작하기 컨텍스트의 진행 상황
        if (input.context === '투자시작하기' && input.currentStep) {
          const completedTasks = input.currentStep.subTasks
            .filter(task => task.completed)
            .map(task => `- ${task.title}: ${task.description}`);
          if (completedTasks.length > 0) {
            info.push(`현재 진행 상황 (${input.currentStep.title}):\n${completedTasks.join('\n')}`);
          }
        }
        
        // 살펴보기 컨텍스트의 선택된 섹터
        if (input.context === '살펴보기' && input.selectedSectors?.length > 0) {
          const selectedSectorInfo = input.selectedSectors
            .filter(sector => sector.checked)
            .map(sector => 
              `- ${sector.name} (${sector.change > 0 ? '+' : ''}${sector.change}%)\n  ETFs: ${
                sector.etfs.map(etf => `${etf.name} (${etf.code})`).join(', ')
              }`
            );
          if (selectedSectorInfo.length > 0) {
            info.push(`선택된 섹터:\n${selectedSectorInfo.join('\n')}`);
          }
        }
        
        // 분석하기 컨텍스트의 선택된 ETF
        if (input.context === '분석하기' && input.selectedETFs?.length > 0) {
          info.push(`선택된 ETF:\n${input.selectedETFs
            .map(etf => 
              `- ${etf.name} (${etf.code})\n  보유: ${etf.amount}주, 평균단가: ${etf.purchasePrice.toLocaleString()}원, 현재가: ${etf.currentPrice.toLocaleString()}원 (${etf.change > 0 ? '+' : ''}${etf.change}%)`
            ).join('\n')}`);
        }
        
        return info.join('\n\n');
      })
    ]);

    return {
      context,
      message,
      chat_history: chatHistory,
      references,
      contextInfo
    };
  },
  async (formattedInput) => {
    const systemTemplate = getTemplateByContext(formattedInput.context);
    const messages = [
      new SystemMessage(systemTemplate),
      new HumanMessage(
        `상황: ${formattedInput.context}\n` +
        `질문: ${formattedInput.message}\n` +
        `대화 기록: ${formattedInput.chat_history}\n` +
        `참고 자료: ${formattedInput.references}\n` +
        (formattedInput.contextInfo ? `${formattedInput.contextInfo}\n` : '')
      )
    ];

    console.time('model_invoke');
    const response = await model.invoke(messages);
    console.timeEnd('model_invoke');
    
    try {
      const contentStr = response.content;
      const cleanedStr = contentStr.toString()
        .replace(/\{+/g, '{')
        .replace(/\}+/g, '}')
        .trim();

      const match = cleanedStr.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error('No valid JSON object found');
      }
      
      const parsed = JSON.parse(match[0]);
      const messageId = `msg_${Date.now()}`;

      return {
        ...parsed,
        messageId,
        parentMessageId: formattedInput.messageId
      };
    } catch (error) {
      console.error('응답 파싱 실패:', error);
      return {
        message: '죄송합니다. 응답을 처리하는 중에 오류가 발생했습니다.',
        references: [],
        relatedTopics: [],
        nextCards: [],
        messageId: `msg_${Date.now()}`
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
      nextCards: Array.isArray(parsedResponse.nextCards) ? parsedResponse.nextCards : [],
      messageId: `msg_${Date.now()}`,  // 새 메시지 ID 생성
      parentMessageId: input.messageId  // 부모 메시지 ID 추적
    };
  } catch (error) {
    console.error('응답 처리 중 오류:', error);
    // 에러 발생 시 기본 응답 구조 반환
    return {
      role: 'assistant',
      content: String(response),
      references: [],
      relatedTopics: [],
      nextCards: [],
      messageId: `msg_${Date.now()}`,  // 새 메시지 ID 생성
      parentMessageId: input.messageId  // 부모 메시지 ID 추적
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

  const timing = {
    start: Date.now(),
    chainStart: 0,
    chainEnd: 0,
    modelStart: 0,
    modelEnd: 0,
  };

  try {
    const input = req.body;
    
    timing.chainStart = Date.now();
    const response = await chain.invoke(input);
    timing.chainEnd = Date.now();

    // 타이밍 로그
    console.log('API 타이밍:', {
      total: timing.chainEnd - timing.start,
      chain: timing.chainEnd - timing.chainStart,
      endpoint: req.url,
      context: input.context,
      messageLength: input.message.length,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('API 오류:', error);
    console.log('실패 타이밍:', {
      totalUntilError: Date.now() - timing.start,
      chainDuration: timing.chainEnd ? timing.chainEnd - timing.chainStart : 0,
    });
    return res.status(500).json({ error: '오류가 발생했습니다' });
  }
} 