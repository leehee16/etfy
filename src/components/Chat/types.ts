export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  // ... 기존 타입 정의
}

export interface ChatState {
  messages: ChatMessage[];
  // ... 기타 상태 관련 타입
} 