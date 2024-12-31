import { NextApiRequest, NextApiResponse } from 'next';
import { ChatOpenAI } from "@langchain/openai";
import { reportPrompt } from './prompts/reportPrompt';

const model = new ChatOpenAI({
  modelName: 'o1-preview'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessions } = req.body;

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

    // 프롬프트 생성
    const formattedPrompt = await reportPrompt.format({
      sessions: sessionsText,
    });

    // 리포트 생성
    const response = await model.invoke(formattedPrompt);

    try {
      const report = JSON.parse(response.content);
      res.status(200).json(report);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      res.status(500).json({ 
        error: 'JSON 파싱 오류가 발생했습니다.',
        content: response.content 
      });
    }
  } catch (error) {
    console.error('리포트 생성 중 오류:', error);
    res.status(500).json({ error: '리포트 생성 중 오류가 발생했습니다.' });
  }
} 