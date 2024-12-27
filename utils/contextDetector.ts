/**
 * 각 컨텍스트별 키워드와 패턴을 정의합니다.
 * 키워드는 해당 컨텍스트와 관련된 주요 단어들입니다.
 */
const contextPatterns = {
  '기초공부하기': {
    keywords: ['뜻', '의미', '개념', '기초', '기본', '설명', '무엇', '뭐', '어떤', '왜'],
    patterns: [
      /(?:은|는|이|가) 뭐(?:예요|야|죠|니까)/,
      /설명해\s*(?:주세요|줘)/,
      /알려\s*(?:주세요|줘)/,
    ]
  },
  '투자시작하기': {
    keywords: ['투자', '시작', '방법', '어떻게', '계좌', '주문', '매수', '매도'],
    patterns: [
      /어떻게.*(?:시작|하나요|할까요)/,
      /(?:투자|거래).*방법/,
      /시작하고.*싶어요/
    ]
  },
  '살펴보기': {
    keywords: ['찾아', '검색', '종목', '상품', '추천', '비교'],
    patterns: [
      /찾아.*(?:주세요|줘)/,
      /추천.*(?:해주세요|해줘)/,
      /(?:상품|종목).*알려/
    ]
  },
  '분석하기': {
    keywords: ['분석', '전망', '예측', '성과', '수익률', '위험', '차트'],
    patterns: [
      /분석.*(?:해주세요|해줘)/,
      /전망.*(?:어떻|어때)/,
      /(?:성과|수익).*어떻/
    ]
  }
};

/**
 * 입력된 텍스트의 컨텍스트를 감지하는 함수
 * @param text 사용자가 입력한 텍스트
 * @returns 감지된 컨텍스트 ('기초공부하기' | '투자시작하기' | '살펴보기' | '분석하기')
 */
export const detectContext = (text: string): string => {
  // 점수를 저장할 객체 초기화
  const scores: { [key: string]: number } = {
    '기초공부하기': 0,
    '투자시작하기': 0,
    '살펴보기': 0,
    '분석하기': 0
  };

  // 각 컨텍스트별로 점수 계산
  Object.entries(contextPatterns).forEach(([context, { keywords, patterns }]) => {
    // 키워드 매칭
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        scores[context] += 1;
      }
    });

    // 패턴 매칭
    patterns.forEach(pattern => {
      if (pattern.test(text)) {
        scores[context] += 2; // 패턴 매칭은 키워드보다 더 높은 가중치
      }
    });
  });

  // 가장 높은 점수를 가진 컨텍스트 반환
  const maxScore = Math.max(...Object.values(scores));
  const detectedContext = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];

  // 기본값으로 '기초공부하기' 반환
  return detectedContext || '기초공부하기';
}; 