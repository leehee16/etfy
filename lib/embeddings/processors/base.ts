import { ChunkingOptions, ProcessedDocument } from '../types';

export abstract class BaseDocumentProcessor {
  protected options: ChunkingOptions;

  constructor(options: Partial<ChunkingOptions> = {}) {
    this.options = {
      minLength: options.minLength || 100,
      maxLength: options.maxLength || 1000,
      overlap: options.overlap || 200
    };
  }

  /**
   * 문서를 처리하여 청크로 분할합니다.
   * @param buffer 처리할 문서의 버퍼
   * @returns 처리된 문서 정보
   */
  abstract process(buffer: Buffer): Promise<ProcessedDocument>;

  /**
   * 텍스트를 청크로 분할합니다.
   * @param text 분할할 텍스트
   * @returns 분할된 청크 배열
   */
  protected abstract splitIntoChunks(text: string): string[];
} 