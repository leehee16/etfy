import { BaseDocumentProcessor } from './base';
import { ChunkingOptions, ProcessedDocument, Section } from '../types';
import { TokenCounter } from '../utils/tokenizer';

// 최대 토큰 제한 및 청크 설정
const MAX_TOKENS_PER_CHUNK = 7000; // 여유를 두고 8192보다 작게 설정
const CHUNK_OVERLAP = 200; // 청크 간 중복되는 토큰 수

export class MarkdownProcessor extends BaseDocumentProcessor {
  constructor(options: Partial<ChunkingOptions> = {}) {
    super(options);
  }

  // 마크다운 텍이블을 텍스트로 변환
  private convertTableToText(tableText: string): string {
    try {
      // 테이블 행을 줄바꿈으로 분리
      const rows = tableText.split('\n').filter(row => row.trim() !== '');
      if (rows.length < 2) return ''; // 헤더와 구분자 행이 없으면 빈 문자열 반환

      // 헤더 행에서 열 이름 추출
      const headers = rows[0]
        .trim()
        .split('|')
        .filter(cell => cell.trim() !== '')
        .map(cell => cell.trim());

      // 구분자 행 제거
      const dataRows = rows.slice(2);

      // 각 데이터 행을 처리
      const processedRows = dataRows.map(row => {
        const cells = row
          .trim()
          .split('|')
          .filter(cell => cell.trim() !== '')
          .map(cell => cell.trim());

        // 헤더와 셀을 결합하여 문장 형태로 변환
        return headers
          .map((header, index) => `${header}: ${cells[index] || ''}`)
          .join('. ');
      });

      return processedRows.join('\n');
    } catch (error) {
      console.error('테이블 변환 중 오류:', error);
      return tableText; // 오류 발생 시 원본 테이블 텍스트 반환
    }
  }

  // 마크다운 텍스트 전처리
  private preprocessMarkdown(text: string): string {
    if (!text || typeof text !== 'string') {
      console.error('유효하지 않은 입력 텍스트:', text);
      throw new Error('유효한 텍스트가 필요합니다.');
    }

    console.log('전처리 전 텍스트 길이:', text.length);
    console.log('전처리 전 텍스트 샘플:', text.substring(0, 200));

    try {
      // YAML 프론트매터 제거
      let processedText = text.replace(/^---\n[\s\S]*?\n---\n/, '');

      // 테이블 처리
      processedText = processedText.replace(
        /(\|[^\n]+\|\n)((?:\|[^\n]+\|\n)+)/g,
        (match) => this.convertTableToText(match) + '\n\n'
      );

      // 기본 마크다운 요소 처리
      processedText = processedText
        // 이미지 제거
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        // 링크는 텍스트만 유지
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // HTML 태그 처리
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        // 인용구 처리
        .replace(/^>\s*(.*)/gm, '$1')
        // 코드 블록 내용 유지
        .replace(/```\w*\n([\s\S]*?)```/g, '$1')
        // 인라인 코드 마커만 제거
        .replace(/`([^`]+)`/g, '$1')
        // 강조 표시 제거하되 텍스트 유지
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        // 체크박스를 텍스트로 변환
        .replace(/- \[x\]/gi, '완료: ')
        .replace(/- \[ \]/g, '할일: ')
        // 헤더 처리
        .replace(/^(#{1,6})\s+(.*)/gm, '$2\n')
        // 목록 처리
        .replace(/^[*-]\s+/gm, '• ')
        // 수평선을 줄바꿈으로 대체
        .replace(/^---+$/gm, '\n')
        // 연속된 줄바꿈 정리
        .replace(/\n{3,}/g, '\n\n')
        // 각 줄의 앞뒤 공백 제거
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0) // 빈 줄 제거
        .join('\n')
        .trim();

      console.log('전처리 후 텍스트 길이:', processedText.length);
      console.log('전처리 후 텍스트 샘플:', processedText.substring(0, 200));

      if (processedText.length < 10) {
        console.warn('전처리 후 텍스트가 너무 짧습니다:', processedText);
        throw new Error('전처리 후 텍스트가 너무 짧습니다');
      }

      return processedText;
    } catch (error) {
      console.error('마크다운 전처리 중 오류:', error);
      throw error;
    }
  }

  // 텍스트를 토큰 제한에 맞게 분할
  protected splitIntoChunks(text: string): string[] {
    if (!text || text.length === 0) {
      console.warn('분할할 텍스트가 없습니다.');
      return [];
    }

    try {
      const chunks: string[] = [];
      let currentChunk = '';
      let currentTokens = 0;

      // 문단 단위로 먼저 분할
      const paragraphs = text.split(/\n{2,}/);
      console.log(`분할된 문단 수: ${paragraphs.length}`);

      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) continue;

        const paragraphTokens = TokenCounter.countTokens(paragraph);
        console.log(`문단 토큰 수: ${paragraphTokens}`);

        // 문단이 최대 토큰 수를 초과하는 경우
        if (paragraphTokens > MAX_TOKENS_PER_CHUNK) {
          // 현재 청크가 있으면 저장
          if (currentChunk) {
            chunks.push(currentChunk);
            currentChunk = '';
            currentTokens = 0;
          }

          // 문장 단위로 분할
          const sentences = paragraph.split(/(?<=[.!?])\s+/);
          for (const sentence of sentences) {
            if (!sentence.trim()) continue;
            
            const sentenceTokens = TokenCounter.countTokens(sentence);

            if (currentTokens + sentenceTokens <= MAX_TOKENS_PER_CHUNK) {
              currentChunk += (currentChunk ? ' ' : '') + sentence;
              currentTokens += sentenceTokens;
            } else {
              if (currentChunk) {
                chunks.push(currentChunk);
              }
              currentChunk = sentence;
              currentTokens = sentenceTokens;
            }
          }
        } else {
          // 문단이 제한을 초과하지 않는 경우
          if (currentTokens + paragraphTokens <= MAX_TOKENS_PER_CHUNK) {
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            currentTokens += paragraphTokens;
          } else {
            chunks.push(currentChunk);
            currentChunk = paragraph;
            currentTokens = paragraphTokens;
          }
        }
      }

      if (currentChunk) {
        chunks.push(currentChunk);
      }

      console.log(`텍스트를 ${chunks.length}개의 청크로 분할했습니다.`);
      chunks.forEach((chunk, i) => {
        console.log(`청크 ${i + 1} 길이: ${chunk.length}, 토큰 수: ${TokenCounter.countTokens(chunk)}`);
      });

      return chunks;
    } catch (error) {
      console.error('청크 분할 중 오류:', error);
      throw error;
    }
  }

  // 마크다운 문서 처리
  async process(buffer: Buffer): Promise<ProcessedDocument> {
    try {
      // 버퍼를 텍스트로 변환
      const text = buffer.toString('utf-8');
      console.log('원본 텍스트 길이:', text.length);
      console.log('원본 텍스트 샘플:', text.substring(0, 200));
      
      // 마크다운 전처리
      const cleanedText = this.preprocessMarkdown(text);
      
      if (!cleanedText) {
        throw new Error('유효한 텍스트를 추출할 수 없습니다.');
      }

      // 텍스트를 청크로 분할
      const chunks = this.splitIntoChunks(cleanedText);
      console.log(`마크다운 텍스트를 ${chunks.length}개의 청크로 분할했습니다.`);

      if (chunks.length === 0) {
        throw new Error('청크를 생성할 수 없습니다.');
      }

      // 섹션 생성
      const section: Section = {
        id: `section_${Date.now()}`,
        title: '마크다운 문서',
        content: cleanedText,
        level: 1,
        children: [],
        metadata: {
          title: '마크다운 문서',
          level: 1,
          index: 0
        }
      };

      // 청크 메타데이터 생성
      return {
        metadata: {
          type: 'markdown',
          source: 'markdown_upload',
          uploadedAt: new Date().toISOString(),
          language: 'ko'
        },
        sections: [section],
        chunks: chunks.map((chunk, index) => ({
          id: `chunk_${Date.now()}_${index}`,
          content: chunk,
          metadata: {
            section: section.metadata,
            chunkIndex: index,
            totalChunks: chunks.length,
            startIndex: index * MAX_TOKENS_PER_CHUNK,
            endIndex: (index + 1) * MAX_TOKENS_PER_CHUNK,
            source: 'markdown_upload',
            type: 'markdown',
            uploadedAt: new Date().toISOString(),
            language: 'ko'
          }
        }))
      };
    } catch (error) {
      console.error('마크다운 처리 중 오류:', error);
      throw error;
    }
  }
} 