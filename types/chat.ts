export interface NextCard {
  title: string;
  description: string;
  type: 'action' | 'question';
  context: '기초공부하기' | '투자시작하기' | '살펴보기' | '분석하기';
}

export interface Reference {
  title: string;
  description: string;
  source: string;
  url?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  context?: string;
  references?: Reference[];
  relatedTopics?: string[];
  nextCards?: NextCard[];
} 