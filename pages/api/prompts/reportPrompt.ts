import { PromptTemplate } from "@langchain/core/prompts";

export const reportPrompt = new PromptTemplate({
  template: `당신은 투자 전문가입니다. 사용자와의 대화 내용을 바탕으로 투자 보고서를 작성해주세요.

대화 내용:
{sessions}

다음 형식으로 보고서를 작성해주세요:
{{
  "title": "보고서 제목",
  "summary": "전체 내용 요약",
  "sections": [
    {{
      "title": "섹션 제목",
      "content": "섹션 내용",
      "recommendations": ["추천사항1", "추천사항2"],
      "references": ["참고자료1", "참고자료2"]
    }}
  ],
  "conclusion": "결론"
}}

보고서는 다음 사항을 포함해야 합니다:
1. 투자 목표와 전략
2. 선택된 ETF와 선정 이유
3. 위험 요소와 대응 방안
4. 구체적인 실행 계획
5. 모니터링 및 리밸런싱 전략

모든 내용은 한국어로 작성해주세요.`,
  inputVariables: ["sessions"]
}); 