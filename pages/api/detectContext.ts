import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    const prompt = `다음 메시지가 어떤 컨텍스트에 해당하는지 판단해주세요.
컨텍스트는 다음 네 가지 중 하나여야 합니다:
- 기초공부하기: ETF의 기본 개념, 용어, 원리 등에 대한 질문
- 투자시작하기: ETF 투자 방법, 계좌 개설, 매매 방법 등에 대한 질문
- 살펴보기: ETF 상품 검색, 비교, 추천 요청 등
- 분석하기: ETF 성과 분석, 포트폴리오 분석, 위험 분석 등

메시지: "${message}"

답변은 컨텍스트 이름만 정확히 작성해주세요.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 50
    });

    const detectedContext = completion.choices[0].message?.content?.trim() || '기초공부하기';

    // 유효한 컨텍스트인지 확인
    const validContexts = ['기초공부하기', '투자시작하기', '살펴보기', '분석하기'];
    const context = validContexts.includes(detectedContext) ? detectedContext : '기초공부하기';

    return res.status(200).json({ context });
  } catch (error: any) {
    console.error('Error:', error.message);
    
    // API 키 관련 에러 처리
    if (error.code === 'auth_error' || error.status === 401) {
      return res.status(500).json({ 
        message: 'OpenAI API 인증 오류가 발생했습니다. API 키를 확인해주세요.',
        context: '기초공부하기'
      });
    }
    
    return res.status(500).json({ 
      message: '컨텍스트 감지 중 오류가 발생했습니다.', 
      context: '기초공부하기' 
    });
  }
} 