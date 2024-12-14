import { OpenAIEmbeddings } from '@langchain/openai';

// OpenAI 임베딩 인스턴스 생성
const embeddings = new OpenAIEmbeddings();

/**
 * 텍스트로부터 임베딩 벡터를 생성합니다.
 * @param text 임베딩할 텍스트
 * @returns 임베딩 벡터 배열
 */
export async function getEmbeddings(text: string): Promise<number[]> {
  if (!text || typeof text !== 'string') {
    throw new Error('유효한 텍스트가 아닙니다.');
  }

  try {
    // 텍스트 정제
    const sanitizedText = text.trim();
    if (!sanitizedText) {
      throw new Error('텍스트가 비어있습니다.');
    }

    // 임베딩 생성
    const [vector] = await embeddings.embedDocuments([sanitizedText]);
    if (!vector || vector.length === 0) {
      throw new Error('임베딩 생성에 실패했습니다.');
    }

    return vector;
  } catch (error) {
    console.error('임베딩 생성 중 오류:', error);
    throw error;
  }
} 