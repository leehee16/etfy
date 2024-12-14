import { get_encoding } from 'tiktoken';

export class TokenCounter {
  // OpenAI의 임베딩 모델 토큰 제한
  static readonly MAX_TOKENS = 8192;
  // 안전한 청크 크기 (임베딩용)
  static readonly SAFE_CHUNK_SIZE = 7000; // 여유있게 7000으로 설정
  // 청크 간 오버랩
  static readonly CHUNK_OVERLAP = 200;
  
  // 텍크나이저 인스턴스 가져오기
  private static getTokenizer() {
    return get_encoding('cl100k_base'); // text-embedding-ada-002 모델용 토크나이저
  }

  // 텍스트의 토큰 수를 정확하게 계산
  static countTokens(text: string): number {
    if (!text || typeof text !== 'string') return 0;
    const tokenizer = this.getTokenizer();
    const tokens = tokenizer.encode(text);
    tokenizer.free(); // 메모리 해제
    return tokens.length;
  }

  // 주어진 최대 토큰 수를 기준으로 텍스트를 안전하게 자름
  static truncateToTokenLimit(text: string, maxTokens: number = this.SAFE_CHUNK_SIZE): string {
    if (!text || typeof text !== 'string') return '';
    const tokenizer = this.getTokenizer();
    const tokens = tokenizer.encode(text);
    
    if (tokens.length <= maxTokens) {
      tokenizer.free();
      return text;
    }

    // maxTokens 크기만큼 토큰을 잘라서 다시 텍스트로 변환
    const truncatedTokens = tokens.slice(0, maxTokens);
    const result = tokenizer.decode(truncatedTokens);
    tokenizer.free();
    return result;
  }

  // 청크의 안전한 크기를 계산 (오버랩 고려)
  static calculateSafeChunkSize(chunkSize: number, overlap: number = this.CHUNK_OVERLAP): number {
    // 오버랩을 포함한 실제 청크 크기가 최대 토큰 수를 넘지 않도록 조정
    const maxSafeSize = this.SAFE_CHUNK_SIZE - overlap;
    return Math.min(chunkSize, maxSafeSize);
  }

  // 텍스트가 토큰 제한을 초과하는지 확인
  static exceedsTokenLimit(text: string, limit: number = this.SAFE_CHUNK_SIZE): boolean {
    if (!text || typeof text !== 'string') return false;
    return this.countTokens(text) > limit;
  }

  // 텍스트를 안전한 크기의 청크로 분할
  static splitIntoSafeChunks(text: string, maxTokens: number = this.SAFE_CHUNK_SIZE): string[] {
    if (!text || typeof text !== 'string') {
      console.warn('분할할 텍스트가 없거나 유효하지 않습니다.');
      return [];
    }

    try {
      const tokenizer = this.getTokenizer();
      const chunks: string[] = [];
      
      // 먼저 문단으로 분할
      const paragraphs = text.split(/\n{2,}/);
      let currentChunk = '';
      let currentTokens: number[] = [];
      
      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) continue;

        const paragraphTokens = tokenizer.encode(paragraph);
        
        // 문단이 최대 크기를 초과하는 경우
        if (paragraphTokens.length > maxTokens) {
          // 현재 청크가 있으면 저장
          if (currentTokens.length > 0) {
            chunks.push(tokenizer.decode(currentTokens));
            currentTokens = [];
          }
          
          // 문장 단위로 분할
          const sentences = paragraph.split(/(?<=[.!?])\s+/);
          let sentenceChunk: number[] = [];
          
          for (const sentence of sentences) {
            if (!sentence.trim()) continue;
            
            const sentenceTokens = tokenizer.encode(sentence);
            
            // 문장이 단독으로 최대 크기를 초과하는 경우
            if (sentenceTokens.length > maxTokens) {
              // 현재 문장 청크가 있으면 저장
              if (sentenceChunk.length > 0) {
                chunks.push(tokenizer.decode(sentenceChunk));
                sentenceChunk = [];
              }
              
              // 문장을 토큰 단위로 분할
              for (let i = 0; i < sentenceTokens.length; i += maxTokens) {
                const tokenChunk = sentenceTokens.slice(i, Math.min(i + maxTokens, sentenceTokens.length));
                chunks.push(tokenizer.decode(tokenChunk));
              }
            }
            // 문장을 현재 청크에 추가할 수 있는 경우
            else if (sentenceChunk.length + sentenceTokens.length <= maxTokens) {
              sentenceChunk.push(...sentenceTokens);
            }
            // 현재 청크가 가득 찬 경우
            else {
              if (sentenceChunk.length > 0) {
                chunks.push(tokenizer.decode(sentenceChunk));
              }
              sentenceChunk = [...sentenceTokens];
            }
          }
          
          // 남은 문장 청크 처리
          if (sentenceChunk.length > 0) {
            chunks.push(tokenizer.decode(sentenceChunk));
          }
        }
        // 문단을 현재 청크에 추가할 수 있는 경우
        else if (currentTokens.length + paragraphTokens.length <= maxTokens) {
          if (currentTokens.length > 0) {
            // 문단 구분을 위한 줄바꿈 토큰 추가
            currentTokens.push(...tokenizer.encode('\n\n'));
          }
          currentTokens.push(...paragraphTokens);
        }
        // 현재 청크가 가득 찬 경우
        else {
          if (currentTokens.length > 0) {
            chunks.push(tokenizer.decode(currentTokens));
          }
          currentTokens = [...paragraphTokens];
        }
      }
      
      // 마지막 청크 처리
      if (currentTokens.length > 0) {
        chunks.push(tokenizer.decode(currentTokens));
      }
      
      tokenizer.free();
      
      // 빈 청크 제거 및 공백 정리
      const validChunks = chunks
        .map(chunk => chunk.trim())
        .filter(chunk => chunk.length > 0);
      
      console.log(`텍스트를 ${validChunks.length}개의 유효한 청크로 분할했습니다.`);
      validChunks.forEach((chunk, i) => {
        console.log(`청크 ${i + 1} 길이: ${chunk.length}, 토큰 수: ${this.countTokens(chunk)}`);
      });
      
      return validChunks;
    } catch (error) {
      console.error('텍스트 분할 중 오류:', error);
      return [text]; // 오류 발생 시 원본 텍스트를 단일 청크로 반환
    }
  }
} 