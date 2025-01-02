import { NextApiRequest, NextApiResponse } from 'next';
import { ChatOpenAI } from "@langchain/openai";
import { reportPrompt } from './prompts/reportPrompt';
import { v4 as uuidv4 } from 'uuid';

// UUID 생성 함수 추가
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const model = new ChatOpenAI({
  modelName: 'o1-preview'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessions, userId } = req.body;

    // 병렬로 처리할 작업들을 정의
    const [sessionsText, metadata] = await Promise.all([
      // 세션 데이터 변환
      Promise.resolve().then(() => 
        Object.entries(sessions)
          .map(([context, data]: [string, any]) => {
            const messages = data.messages
              .map((msg: any) => {
                let text = `${msg.role}: ${msg.content}`;
                if (msg.selectedTexts?.length) {
                  text += `\n선택된 텍스트: ${msg.selectedTexts.join(', ')}`;
                }
                if (msg.selectedSectors?.length) {
                  text += `\n선택된 섹터: ${msg.selectedSectors.join(', ')}`;
                }
                if (msg.selectedETFs?.length) {
                  text += `\n선택된 ETF: ${msg.selectedETFs.join(', ')}`;
                }
                if (msg.currentStep) {
                  text += `\n현재 단계: ${msg.currentStep}`;
                }
                return text;
              })
              .join('\n');
            return `=== ${context} ===\n${messages}`;
          })
          .join('\n\n')
      ),
      // 메타데이터 생성
      Promise.resolve().then(() => ({
        sessionCount: Object.keys(sessions).length,
        contexts: Object.keys(sessions),
        sectors: Object.values(sessions)
          .flatMap((session: any) => 
            session.messages
              .flatMap((msg: any) => msg.selectedSectors || [])
          )
          .filter((sector, index, self) => self.indexOf(sector) === index),
        etfs: Object.values(sessions)
          .flatMap((session: any) => 
            session.messages
              .flatMap((msg: any) => msg.selectedETFs || [])
          )
          .filter((etf, index, self) => self.indexOf(etf) === index),
      }))
    ]);

    const formattedPrompt = await reportPrompt.format({
      sessions: sessionsText,
    });

    const response = await model.invoke(formattedPrompt);

    try {
      // 디버깅을 위한 로깅 추가
      console.log('Raw response:', response);
      console.log('Response type:', typeof response.content);
      
      let contentStr = '';
      if (typeof response.content === 'string') {
        contentStr = response.content;
      } else if (Array.isArray(response.content)) {
        contentStr = response.content
          .map(item => {
            if (typeof item === 'string') return item;
            if ('text' in item) return item.text;
            return '';
          })
          .join('');
      } else if (response.content && typeof response.content === 'object') {
        if ('text' in response.content) {
          contentStr = (response.content as { text: string }).text;
        } else {
          contentStr = JSON.stringify(response.content);
        }
      }

      console.log('Processed content:', contentStr);
      
      const report = JSON.parse(contentStr);
      
      // 보고서에 메타데이터 추가
      const now = new Date();
      const reportWithMeta = {
        id: generateId(),
        ...report,
        date: now.toISOString(),
        metadata: {
          createdAt: now.toISOString(),
          ...metadata
        }
      };

      return res.status(200).json({ report: reportWithMeta });
      
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return res.status(500).json({ error: 'JSON 파싱 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('리포트 생성 중 오류:', error);
    return res.status(500).json({ error: '리포트 생성 중 오류가 발생했습니다.' });
  }
} 