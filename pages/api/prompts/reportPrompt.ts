import { PromptTemplate } from "@langchain/core/prompts";
import { UX_WRITING_GUIDE, REPORT_SECTIONS } from './uxWritingGuide';

const LEGAL_DISCLAIMER = `이 서비스는 금융상품에 대한 정보를 알려드리기 위한 곳이에요. 투자 권유나 금융상품 추천을 드리려는 건 아니니 참고만 해주세요.

ETFy는 투자 자문이나 금융상품 추천 기능이 없어요. 결국 어떤 결정을 내릴지는 고객님이 직접 고민하고 판단하셔야 해요.

과거의 투자 실적이 미래의 수익을 보장하지 않으며, 투자는 원금 손실의 위험이 있다는 점을 꼭 기억해주세요.`;

export const reportPrompt = new PromptTemplate({
  template: `당신은 투자 전문가입니다. 다음 UX Writing 지침을 따라 사용자와의 대화 내용을 바탕으로 투자 보고서를 작성해주세요.

UX Writing 지침:
${UX_WRITING_GUIDE}

대화 내용:
{sessions}

제목 작성 지침:
1. 제목은 사용자의 통합질의를 정리하는 형식으로 작성해주세요.
2. 예시: "반도체 섹터 에서 이슈 탐색"

다음 형식으로 보고서를 작성해주세요:
{{
  "title": "보고서 제목 (위 지침에 따라 작성)",
  "context recognition" : 지난 대화 내용으로부터 사용자의 질의 목적과 의도를 종합적으로 판단하고 적어주세요.
  "summary": "전체 내용 요약",
  "sections": [
    {{
      "title": "섹션 제목",
      "content": "섹션 내용",
      "recommendations": ["추천사항1", "추천사항2"],
      "references": ["참고자료1", "참고자료2"]
    }}
  ],
  "conclusion": "결론",
  "disclaimer": "투자 유의사항\\n\\n${LEGAL_DISCLAIMER}"
}}

보고서는 다음 섹션들을 포함해야 합니다:
1. ${REPORT_SECTIONS.INVESTMENT_GOAL}
2. ${REPORT_SECTIONS.ETF_SELECTION}
3. ${REPORT_SECTIONS.RISK_FACTORS}
4. ${REPORT_SECTIONS.ACTION_PLAN}
5. ${REPORT_SECTIONS.MONITORING}

모든 내용은 한국어로 작성해주세요.`,
  inputVariables: ["sessions"]
}); 