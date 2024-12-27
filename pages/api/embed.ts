import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { ProcessedDocument, EmbeddingResponse, EmbeddingResult } from '@/lib/embeddings/types';
import { getEmbeddings } from '@/lib/embeddings/embeddings';
import { getDocumentProcessor } from '@/lib/embeddings/processors';
import { storeDocuments } from '@/config/vectordb';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function processChunks(doc: ProcessedDocument): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = [];
  console.log(`텍스트를 ${doc.chunks.length}개의 청크로 분할합니다...`);
  
  for (let i = 0; i < doc.chunks.length; i++) {
    const chunk = doc.chunks[i];
    console.log(`청크 ${i + 1}/${doc.chunks.length} 임베딩 중...`);
    
    try {
      // 청크 내용이 비어있지 않은지 확인
      if (!chunk.content || typeof chunk.content !== 'string' || chunk.content.trim().length === 0) {
        console.warn(`청크 ${i + 1}의 내용이 비어있습니다. 건너뜁니다.`);
        continue;
      }

      const embedding = await getEmbeddings(chunk.content);
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        console.warn(`청크 ${i + 1}의 임베딩 생성 실패`);
        continue;
      }
      
      results.push({
        id: chunk.id,
        embedding,
        metadata: chunk.metadata,
        content: chunk.content
      });

      console.log(`청크 ${i + 1} 임베딩 완료 (차원: ${embedding.length})`);
    } catch (error) {
      console.error(`청크 ${i + 1} 임베딩 중 오류:`, error);
      // 개별 청크 실패는 전체 프로세스를 중단하지 않음
      continue;
    }
  }
  
  return results;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmbeddingResponse | { error: string; details?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않는 메소드입니다.' });
  }

  let filepath: string | undefined;

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }

    filepath = file.filepath;
    console.log('파일 정보:', file);

    // 파일 처리
    const buffer = await fs.readFile(filepath);
    console.log('파일 읽기 완료:', { 
      bufferSize: buffer.length, 
      isBuffer: Buffer.isBuffer(buffer) 
    });

    // 문서 처리기 가져오기
    const processor = getDocumentProcessor(file.mimetype);
    const processedDoc = await processor.process(buffer);

    if (!processedDoc.chunks || processedDoc.chunks.length === 0) {
      throw new Error('문서에서 청크를 추출할 수 없습니다.');
    }

    // 임베딩 생성
    const embeddingResults = await processChunks(processedDoc);
    
    if (!embeddingResults || embeddingResults.length === 0) {
      throw new Error('임베딩 결과가 없습니다.');
    }

    // Pinecone에 임베딩 저장
    const documents = embeddingResults.map(result => ({
      text: result.content,
      source: file.originalFilename || 'unknown_file'
    }));

    // Pinecone에 저장
    const storedCount = await storeDocuments(documents);
    console.log(`${storedCount}개의 청크가 Pinecone에 저장되었습니다.`);

    const response: EmbeddingResponse = {
      success: true,
      embeddings: embeddingResults,
      metadata: processedDoc.metadata,
      storedCount
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('임베딩 처리 중 오류:', error);
    return res.status(500).json({ 
      error: '임베딩 처리 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  } finally {
    // 임시 파일 삭제
    if (filepath) {
      try {
        await fs.unlink(filepath);
      } catch (error) {
        console.error('임시 파일 삭제 중 오류:', error);
      }
    }
  }
} 