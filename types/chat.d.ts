export interface Message {
  role: 'user' | 'assistant';
  content: string;
  context?: string;
  references?: Array<{
    title: string;
    description: string;
    source: string;
    url?: string;
    imageUrl?: string;
  }>;
  relatedTopics?: string[];
  nextCards?: Array<{
    title: string;
    description: string;
    type: 'action' | 'question';
  }>;
  messageId?: string;
  parentMessageId?: string;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  context: string;
  lastUpdated: number;
  summary?: string;
  topics?: string[];
} 