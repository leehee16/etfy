export interface DocumentMetadata {
    source: string;                 // 문서 출처 (파일명)
    title?: string;                 // 문서 제목
    type: string;                   // 문서 타입 (pdf, markdown, text 등)
    category?: string;              // 문서 카테고리
    uploadedAt: string;             // 업로드 시간
    language: string;               // 문서 언어
  }
  
  export interface SectionMetadata {
    title: string;                  // 섹션 제목
    level: number;                  // 제목 레벨 (h1, h2, h3 등)
    pageNumber?: number;            // 페이지 번호 (PDF의 경우)
    index: number;                  // 섹션 순서
    parent?: string;                // 부모 섹션 ID
  }
  
  export interface ChunkMetadata extends DocumentMetadata {
    section: SectionMetadata;       // 섹션 정보
    chunkIndex: number;             // 청크 순서
    totalChunks: number;            // 전체 청크 수
    prevChunkId?: string;           // 이전 청크 ID
    nextChunkId?: string;           // 다음 청크 ID
    startIndex: number;             // 원본 텍스트에서의 시작 위치
    endIndex: number;               // 원본 텍스트에서의 끝 위치
  }
  
  export interface ChunkingOptions {
    minLength: number;
    maxLength: number;
    overlap: number;
  }
  
  export interface ProcessedChunk {
    id: string;                     // 청크 ID
    content: string;                // 청크 내용
    metadata: ChunkMetadata;        // 청크 메타데이터
  }
  
  export interface Section {
    id: string;                     // 섹션 ID
    title: string;                  // 섹션 제목
    content: string;                // 섹션 내용
    level: number;                  // 제목 레벨
    children: Section[];            // 하위 섹션
    metadata: SectionMetadata;      // 섹션 메타데이터
  }
  
  export interface ProcessedDocument {
    metadata: DocumentMetadata;     // 문서 메타데이터
    sections: Section[];            // 섹션 목록
    chunks: ProcessedChunk[];       // 청크 목록
  }
  
  export interface EmbeddingResult {
    id: string;
    embedding: number[];
    metadata: ChunkMetadata;
    content: string;
  }
  
  export interface EmbeddingResponse {
    success: boolean;
    embeddings: EmbeddingResult[];
    metadata: DocumentMetadata;
  }