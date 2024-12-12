import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import OpenAI from 'openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY is not set');
}

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('PINECONE_INDEX_NAME is not set');
}

if (!process.env.PINECONE_ENVIRONMENT) {
  throw new Error('PINECONE_ENVIRONMENT is not set');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const NAMESPACE = 'etf-docs';
const EMBEDDING_MODEL = 'text-embedding-ada-002';
const DIMENSION = 1536;

interface DocumentMetadata {
  text: string;
  category?: string;
  source: string;
  timestamp?: string;
  [key: string]: unknown;
}

interface ChunkOptions {
  chunkSize?: number;        // 각 청크의 최대 길이
  chunkOverlap?: number;     // 청크 간 중복되는 문자 수
  separators?: string[];     // 텍스트를 나눌 구분자들
}

const DEFAULT_CHUNK_OPTIONS: ChunkOptions = {
  chunkSize: 1000,          // 기본 청크 크기
  chunkOverlap: 200,        // 기본 중복 크기
  separators: ['\n\n', '\n', '. ', '? ', '! ']  // 기본 구분자
};

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 텍스트를 임베딩 벡터로 변환하는 함수
export const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.replace(/\n/g, ' '), // 개행 문자 제거
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    throw error;
  }
};

// 텍스트를 청크로 분할하는 함수
const splitTextIntoChunks = async (
  text: string, 
  options: ChunkOptions = DEFAULT_CHUNK_OPTIONS
): Promise<string[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options.chunkSize || DEFAULT_CHUNK_OPTIONS.chunkSize,
    chunkOverlap: options.chunkOverlap || DEFAULT_CHUNK_OPTIONS.chunkOverlap,
    separators: options.separators || DEFAULT_CHUNK_OPTIONS.separators,
  });

  const chunks = await splitter.splitText(text);
  return chunks;
};

// 문서를 임베딩하고 Pinecone에 저장하는 함수
export const embedAndStore = async (documents: { 
  text: string; 
  metadata: { 
    source: string;
    category?: string;
    [key: string]: unknown; 
  }
}[], chunkOptions?: ChunkOptions) => {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    
    // 인덱스 정보 확인
    const indexStats = await index.describeIndexStats();
    console.log('Index stats:', indexStats);

    // 차원 확인
    if (indexStats.dimension !== DIMENSION) {
      throw new Error(`Index dimension (${indexStats.dimension}) does not match required dimension (${DIMENSION})`);
    }

    // 각 문서를 청크로 나누고 임베딩
    const vectors = await Promise.all(
      documents.flatMap(async (doc) => {
        if (!doc.metadata.source) {
          throw new Error('문서 출처 정보가 필요합니다');
        }

        // 텍스트를 청크로 분할
        const chunks = await splitTextIntoChunks(doc.text, chunkOptions);
        
        // 각 청크를 임베딩
        return Promise.all(chunks.map(async (chunk, chunkIndex) => {
          const metadata = {
            text: chunk,
            chunkIndex,
            totalChunks: chunks.length,
            timestamp: new Date().toISOString(),
            ...doc.metadata  // 기존 메타데이터를 먼저 spread
          };

          return {
            id: `doc_${Date.now()}_${chunkIndex}`,
            values: await getEmbedding(chunk),
            metadata
          };
        }));
      })
    );

    // 벡터 업서트 - 중첩 배열을 평탄화
    const flattenedVectors = vectors.flat();
    await index.upsert(flattenedVectors);
    console.log(`${flattenedVectors.length}개의 청크가 성공적으로 임베딩되어 저장되었습니다`);
    
    return flattenedVectors.length;
  } catch (error) {
    console.error('문서 임베딩 및 저장 중 오류:', error);
    throw error;
  }
};

// Pinecone 초기화
export const initPinecone = async () => {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    
    // 인덱스 정보 확인
    const indexStats = await index.describeIndexStats();
    console.log('Index stats:', indexStats);

    // 차원 확인
    if (indexStats.dimension !== DIMENSION) {
      throw new Error(`Index dimension (${indexStats.dimension}) does not match required dimension (${DIMENSION})`);
    }

    return index;
  } catch (error) {
    console.error('Pinecone initialization error:', error);
    throw error;
  }
};

// LangChain 벡터 스토어 초기화
export const initVectorStore = async () => {
  const pineconeIndex = await initPinecone();
  
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: EMBEDDING_MODEL,
    stripNewLines: true,
    verbose: true,
  });

  return await PineconeStore.fromExistingIndex(embeddings, { 
    pineconeIndex,
    namespace: NAMESPACE,
    textKey: 'text',
    filter: { source: { $exists: true } }
  });
}; 