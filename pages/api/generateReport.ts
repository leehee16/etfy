import { NextApiRequest, NextApiResponse } from 'next';
import { ChatOpenAI } from "@langchain/openai";
import { reportPrompt } from './prompts/reportPrompt';
import { v4 as uuidv4 } from 'uuid';

const model = new ChatOpenAI({
  modelName: 'o1-preview'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessions, userId } = req.body;

    // 세션 데이터를 문자열로 변환
    const sessionsText = Object.entries(sessions)
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
      .join('\n\n');

    const formattedPrompt = await reportPrompt.format({
      sessions: sessionsText,
    });

    const response = await model.invoke(formattedPrompt);

    try {
      const report = JSON.parse(response.content);
      
      // 보고서에 메타데이터 추가
      const now = new Date();
      const reportWithMeta = {
        id: uuidv4(),
        ...report,
        date: now.toISOString(),
        metadata: {
          createdAt: now.toISOString(),
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