import { NextApiRequest, NextApiResponse } from 'next';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, context } = req.body;

    const systemPrompt = `당신은 ETF 투자 전문가입니다. 사용자의 메시지를 분석하여 적절한 투자 단계와 세부 작업을 생성해주세요.
응답은 다음과 같은 형식의 JSON 배열이어야 합니다:

{
  "steps": [
    {
      "id": number,
      "title": string,
      "description": string,
      "progress": number,
      "subTasks": [
        {
          "id": string,
          "title": string,
          "description": string,
          "completed": boolean,
          "weight": number
        }
      ]
    }
  ],
  "currentStepIndex": number  // 현재 진행해야 할 단계의 인덱스
}

다음 규칙을 반드시 따라주세요:
1. 최소 3단계, 최대 5단계를 생성해야 합니다.
2. 각 단계는 순차적으로 진행되어야 하며, 이전 단계가 완료되어야 다음 단계로 넘어갈 수 있습니다.
3. 각 단계별로 2-4개의 서브태스크를 포함해야 합니다.
4. 각 단계 내 서브태스크의 weight 합은 100이 되어야 합니다.
5. 모든 단계의 progress는 0으로 시작합니다.
6. 모든 서브태스크의 completed는 false로 시작합니다.
7. currentStepIndex는 0부터 시작합니다.

예시 단계:
- 투자 준비: 계좌 개설, 투자 성향 파악 등
- 투자 계획: 투자 금액 설정, 투자 기간 결정 등
- ETF 선택: ETF 정보 조사, 비교 분석 등
- 투자 실행: 매수 주문, 주문 확인 등
- 투자 관리: 포트폴리오 모니터링, 리밸런싱 계획 등`;

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`사용자 메시지: ${message}\n컨텍스트: ${context}`)
    ]);

    try {
      const contentStr = response.content;
      const match = contentStr.toString().match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error('No valid JSON object found');
      }
      
      const result = JSON.parse(match[0]);
      // 현재 단계만 반환
      const currentStep = result.steps[result.currentStepIndex];
      return res.status(200).json({ 
        step: currentStep,
        allSteps: result.steps,
        currentStepIndex: result.currentStepIndex
      });
    } catch (error) {
      console.error('응답 파싱 실패:', error);
      return res.status(500).json({ message: '단계 생성 중 오류가 발생했습니다.' });
    }
  } catch (error) {
    console.error('API 오류:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
} 