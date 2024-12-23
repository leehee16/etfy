import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false,
  },
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
    const file = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!file) {
      return res.status(400).json({ message: '이미지가 필요합니다.' });
    }

    const base64Image = fs.readFileSync(file.filepath).toString('base64');

    const prompt = {
      instruction: "이미지를 분석하고 관련된 질문들을 생성해주세요.",
      responseFormat: {
        type: "json",
        structure: {
          questions: ["string"],
          context: "string",
          suggestedTopics: ["string"]
        }
      },
      rules: [
        "이미지의 주요 요소와 세부사항을 파악하세요",
        "이미지와 관련된 구체적인 질문을 생성하세요",
        "질문은 대화를 자연스럽게 이어갈 수 있도록 구성하세요",
        "이미지의 맥락을 고려하여 관련 주제를 제안하세요"
      ],
      contextEnhancement: [
        "이미지의 시각적 특징을 상세히 설명하세요",
        "이미지에서 발견되는 패턴이나 관계를 파악하세요",
        "이미지의 의도나 목적을 추론하세요"
      ]
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: JSON.stringify(prompt) },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    let analysis;
    try {
      const content = response.choices[0].message?.content;
      if (!content) {
        throw new Error('응답이 비어있습니다');
      }
      
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
      
      if (!Array.isArray(analysis.questions)) {
        throw new Error('questions 필드가 배열이 아닙니다');
      }
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      analysis = {
        questions: ['이 이미지에 대해 어떤 점이 궁금하신가요?'],
        context: '기초공부하기',
        suggestedTopics: ['ETF 기초']
      };
    }
    
    const nextCards = analysis.questions.map((question: string) => ({
      title: question,
      content: question,
      type: 'question',
      context: analysis.context || '기초공부하기'
    }));

    return res.status(200).json({
      nextCards,
      context: analysis.context || '기초공부하기',
      suggestedTopics: analysis.suggestedTopics || []
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return res.status(500).json({ message: '이미지 처리 중 오류가 발생했습니다.' });
  }
} 