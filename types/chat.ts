export interface NextCard {
  title: string;
  description: string;
  type: 'action' | 'question';
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  context?: string;
  references?: Reference[];
  relatedTopics?: string[];
  nextCards?: NextCard[];
}

export interface Reference {
  title: string;
  description: string;
  source: string;
  url?: string;
  imageUrl?: string;
} 