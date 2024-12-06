import { NextApiRequest, NextApiResponse } from 'next';
import { initVectorStore } from '@/config/vectordb';
import { Document } from 'langchain/document';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const processFile = (content: string, filename: string) => {
  const ext = path.extname(filename).toLowerCase();
  
  // 마크다운 파일의 경우 front matter 제거 (있는 경우)
  if (ext === '.md') {
    // front matter가 있는 경우 제거 (--- 로 둘러싸인 부분)
    content = content.replace(/^---[\s\S]*?---\n/, '');
    
    // 마크다운 링크를 일반 텍스트로 변환 ([text](url) -> text)
    content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // 코드 블록에서 언어 지정자 제거
    content = content.replace(/```\w+\n/g, '```\n');
  }

  return content;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ message: '파일이 없습니다.' });
    }

    // 파일 확장자 확인
    const ext = path.extname(file.originalFilename || '').toLowerCase();
    const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx', '.md'];
    
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ 
        message: '지원하지 않는 파일 형식입니다. (.txt, .pdf, .doc, .docx, .md 파일만 지원)' 
      });
    }

    // 파일 내용 읽기
    const content = fs.readFileSync(file.filepath, 'utf8');
    
    // 파일 내용 처리
    const processedContent = processFile(content, file.originalFilename || '');

    // 문서 생성
    const docs = [
      new Document({
        pageContent: processedContent,
        metadata: {
          source: file.originalFilename,
          type: file.mimetype,
          uploadedAt: new Date().toISOString(),
        },
      }),
    ];

    // 벡터 스토어 초기화
    const vectorStore = await initVectorStore();

    // 문서 추가
    await vectorStore.addDocuments(docs);

    res.status(200).json({ 
      message: '문서가 성공적으로 임베딩되었습니다.',
      filename: file.originalFilename
    });
  } catch (error) {
    console.error('임베딩 중 오류:', error);
    res.status(500).json({ message: '임베딩 중 오류가 발생했습니다.' });
  }
} 