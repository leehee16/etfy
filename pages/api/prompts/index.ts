import { basicStudyTemplate } from './basicStudy';
import { startInvestTemplate } from './startInvest';
import { exploreTemplate } from './explore';
import { analyzeTemplate } from './analyze';

const templates = {
  '기초공부하기': basicStudyTemplate,
  '투자시작하기': startInvestTemplate,
  '살펴보기': exploreTemplate,
  '분석하기': analyzeTemplate,
  'default': basicStudyTemplate
};

export const getTemplateByContext = (context: string = ''): string => {
  return templates[context as keyof typeof templates] || templates.default;
}; 