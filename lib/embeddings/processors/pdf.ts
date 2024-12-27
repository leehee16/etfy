import PDFParser from 'pdf2json';
import { BaseDocumentProcessor } from './base';
import { ChunkingOptions, ProcessedDocument, Section } from '../types';
import { TokenCounter } from '../utils/tokenizer';

export class PDFProcessor extends BaseDocumentProcessor {
  constructor(options: Partial<ChunkingOptions> = {}) {
    super(options);
  }

  // PDF 파일에서 텍스트 추출 및 전처리
  private async extractText(buffer: Buffer): Promise<string> {
    // 버퍼 유효성 검사
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error('유효하지 않은 PDF 데이터입니다.');
    }

    return new Promise((resolve, reject) => {
      try {
        const pdfParser = new PDFParser(null, 1); // 1: PDF 버전 (기본값)

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            if (!pdfData || !pdfData.Pages || pdfData.Pages.length === 0) {
              reject(new Error('PDF에서 텍스트를 추출할 수 없습니다.'));
              return;
            }

            // PDF 페이지별로 텍스트 추출
            const extractedText = pdfData.Pages.map((page: any) => {
              if (!page.Texts || page.Texts.length === 0) return '';

              return page.Texts
                .map((text: any) => {
                  if (!text.R || !text.R[0] || !text.R[0].T) return '';

                  // 디코딩 및 특수 문자 처리
                  try {
                    return decodeURIComponent(text.R[0].T)
                      .replace(/\+/g, ' ') // URL 인코딩된 공백 처리
                      .replace(/%2[Cc]/g, ',') // 쉼표
                      .replace(/%2[Ee]/g, '.') // 마침표
                      .replace(/%3[Bb]/g, ';') // 세미콜론
                      .replace(/%2[Dd]/g, '-') // 하이픈
                      .replace(/%2[Ff]/g, '/') // 슬래시
                      .replace(/%5[Bb]/g, '[') // 대괄호
                      .replace(/%5[Dd]/g, ']')
                      .replace(/%2[Aa]/g, '*') // 별표
                      .replace(/%3[Ff]/g, '?') // 물음표
                      .replace(/%21/g, '!') // 느낌표
                      .replace(/%40/g, '@') // @ 기호
                      .replace(/%23/g, '#') // # 기호
                      .replace(/%24/g, '$') // $ 기호
                      .replace(/%5[Ee]/g, '^') // ^ 기호
                      .replace(/%26/g, '&') // & 기호
                      .replace(/%28/g, '(') // 괄호
                      .replace(/%29/g, ')')
                      .replace(/%7[Bb]/g, '{') // 중괄호
                      .replace(/%7[Dd]/g, '}')
                      .replace(/%3[Cc]/g, '<') // 부등호
                      .replace(/%3[Ee]/g, '>');
                  } catch (e) {
                    console.warn('텍스트 디코딩 중 오류:', e);
                    return '';
                  }
                })
                .filter(Boolean)
                .join(' ');
            })
            .filter(Boolean)
            .join('\n\n');

            // 텍스트 전처리
            const cleanedText = extractedText
              .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '') // 제어 문자 제거
              .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // 유니코드 대체 문자 제거
              .replace(/[^\S\n]+/g, ' ') // 연속된 공백을 단일 공백으로 (줄바꿈 유지)
              .replace(/\n{3,}/g, '\n\n') // 3개 이상의 연속된 줄바꿈을 2개로
              .trim();

            if (this.isValidText(cleanedText)) {
              resolve(cleanedText);
            } else {
              reject(new Error('유효한 텍스트를 추출할 수 없습니다.'));
            }
          } catch (error) {
            reject(error);
          }
        });

        pdfParser.on('pdfParser_dataError', (errData: any) => {
          console.error('PDF 파싱 오류:', errData);
          reject(new Error('PDF 파싱에 실패했습니다.'));
        });

        // PDF 파싱 시작
        pdfParser.parseBuffer(buffer);

      } catch (error) {
        reject(error);
      }
    });
  }

  // 텍스트가 유효한지 검사
  private isValidText(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    
    // 유효하지 않은 문자의 비율이 높은 경우 제외
    const invalidChars = text.match(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F\uFFFD\uFFFE\uFFFF]/g);
    if (invalidChars && invalidChars.length > text.length * 0.1) {
      return false;
    }

    // 최소 유효 텍스트 길이 확인 (공백 제외)
    const validContent = text.replace(/\s+/g, '').trim();
    return validContent.length >= 10;
  }

  // PDF 문서 처리
  async process(buffer: Buffer): Promise<ProcessedDocument> {
    try {
      // PDF에서 텍스트 추출
      const text = await this.extractText(buffer);
      
      if (!text) {
        throw new Error('유효한 텍스트를 추출할 수 없습니다.');
      }

      // 섹션 생성
      const section: Section = {
        id: `section_${Date.now()}`,
        title: 'PDF Document',
        content: text,
        level: 1,
        children: [],
        metadata: {
          title: 'PDF Document',
          level: 1,
          index: 0
        }
      };

      let chunks: string[] = [text];
      // 토큰 수 확인 및 필요시 분할
      if (TokenCounter.exceedsTokenLimit(text)) {
        chunks = TokenCounter.splitIntoSafeChunks(text);
        console.warn(`PDF 텍스트가 토큰 제한을 초과하여 ${chunks.length}개의 청크로 분할되었습니다.`);
      }

      return {
        sections: [section],
        metadata: {
          type: 'pdf',
          source: 'pdf_upload',
          uploadedAt: new Date().toISOString(),
          language: 'ko'
        },
        chunks: chunks.map((chunk, index) => ({
          id: `chunk_${Date.now()}_${index}`,
          content: chunk,
          metadata: {
            section: section.metadata,
            chunkIndex: index,
            totalChunks: chunks.length,
            startIndex: index * TokenCounter.SAFE_CHUNK_SIZE,
            endIndex: (index + 1) * TokenCounter.SAFE_CHUNK_SIZE,
            source: 'pdf_upload',
            type: 'pdf',
            uploadedAt: new Date().toISOString(),
            language: 'ko'
          }
        }))
      };
    } catch (error) {
      console.error('PDF 처리 중 오류:', error);
      throw error;
    }
  }
} 