/**
 * vectordb.ts
 * Pinecone 벡터 데이터베이스 연동 및 문서 임베딩 관리
 */

import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// 환경 변수 검증
const requiredEnvVars = {
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) throw new Error(`${key}가 설정되지 않았습니다`);
});

// 상수
const EMBEDDING_MODEL = 'text-embedding-ada-002';
const VECTOR_DIMENSION = 1536;
const BATCH_SIZE = 10; // 한 번에 처리할 문서 수
const TOP_K = 5; // 검색 결과 개수

// OpenAI 클라이언트
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Pinecone 클라이언트
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Pinecone 인덱스 초기화
let vectorStore: ReturnType<typeof pinecone.index>;

export async function initVectorStore() {
  if (!vectorStore) {
    vectorStore = pinecone.index(process.env.PINECONE_INDEX_NAME!);
  }
  return vectorStore;
}

/**
 * 파일명을 ASCII 문자열로 변환
 */
function convertToAscii(str: string): string {
  return str
    .replace(/[^\x00-\x7F]/g, '') // non-ASCII 문자 제거
    .replace(/[^a-zA-Z0-9-_]/g, '_') // 특수문자를 언더스코어로 변환
    .replace(/_+/g, '_') // 연속된 언더스코어를 하나로
    .replace(/^_|_$/g, ''); // 시작과 끝의 언더스코어 제거
}

/**
 * 텍스트로부터 임베딩 벡터 생성
 */
async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.replace(/\n/g, ' ').trim(),
  });

  return Array.from(response.data[0].embedding);
}

/**
 * 문서 배치를 Pinecone에 저장
 */
async function storeBatch(vectors: Array<{
  id: string;
  values: number[];
  metadata: { source: string; text: string };
}>): Promise<boolean> {
  try {
    const index = await initVectorStore();
    await index.upsert(vectors);
    return true;
  } catch (error) {
    console.error('배치 저장 실패:', error);
    return false;
  }
}

/**
 * 여러 문서를 Pinecone에 저장
 */
export async function storeDocuments(documents: Array<{ text: string; source: string }>): Promise<number> {
  let successCount = 0;
  const vectors = [];

  for (const doc of documents) {
    try {
      const embedding = await createEmbedding(doc.text);
      const timestamp = Date.now();
      const safeSource = convertToAscii(doc.source);
      
      vectors.push({
        id: `${safeSource}_${timestamp}_${vectors.length}`,
        values: embedding,
        metadata: {
          source: doc.source, // 원본 파일명은 메타데이터에 유지
          text: doc.text
        }
      });

      // API 속도 제한을 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`문서 임베딩 생성 중 오류:`, error);
      continue;
    }
  }

  // 배치 처리
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    const success = await storeBatch(batch);
    if (success) {
      successCount += batch.length;
    }
    // 배치 간 딜레이
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return successCount;
}

/**
 * 쿼리와 유사한 문서 검색
 */
export async function queryDocuments(query: string) {
  try {
    // 1. 쿼리 임베딩 생성
    const queryEmbedding = await createEmbedding(query);

    // 2. Pinecone 검색
    const index = await initVectorStore();
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: TOP_K,
      includeMetadata: true
    });

    // 3. 검색 결과 변환
    return queryResponse.matches.map(match => ({
      score: match.score,
      metadata: match.metadata,
    }));

  } catch (error) {
    console.error('문서 검색 중 오류:', error);
    return [];
  }
}

/**
 * Pinecone 연결 테스트
 */
export async function testPineconeConnection(): Promise<boolean> {
  try {
    const index = await initVectorStore();
    const stats = await index.describeIndexStats();
    
    console.log('Pinecone 연결 테스트 성공:', {
      dimension: stats.dimension,
      totalVectorCount: stats.totalVectorCount,
      indexFullness: stats.indexFullness
    });

    return true;
  } catch (error) {
    console.error('Pinecone 연결 테스트 실패:', error);
    return false;
  }
} 