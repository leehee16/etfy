import { PDFProcessor } from './pdf';
import { MarkdownProcessor } from './markdown';
import { BaseDocumentProcessor } from './base';

/**
 * MIME 타입에 따른 적절한 문서 처리기를 반환합니다.
 */
export function getDocumentProcessor(mimetype: string): BaseDocumentProcessor {
  // PDF 파일 처리기
  if (
    mimetype === 'application/pdf' ||
    mimetype === 'application/x-pdf' ||
    mimetype === 'application/acrobat' ||
    mimetype === 'application/vnd.pdf'
  ) {
    return new PDFProcessor();
  }
  
  // 마크다운 파일 처리기
  if (
    mimetype === 'text/markdown' ||
    mimetype === 'text/x-markdown'
  ) {
    return new MarkdownProcessor();
  }

  throw new Error(`지원하지 않는 파일 형식입니다: ${mimetype}`);
}

// 문서 처리기 클래스들 export
export { PDFProcessor, MarkdownProcessor, BaseDocumentProcessor }; 