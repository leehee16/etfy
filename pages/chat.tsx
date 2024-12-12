import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import RightPanel from '@/components/RightPanel';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  status?: 'loading' | 'streaming' | 'complete';
  timestamp?: number;
}

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentReferences, setCurrentReferences] = useState([]);
  const [relatedTopics, setRelatedTopics] = useState([]);

  // 초기 메시지 설정
  useEffect(() => {
    const { initialMessage } = router.query;
    if (initialMessage && typeof initialMessage === 'string') {
      setMessages([{
        role: 'user',
        content: initialMessage,
        status: 'complete',
        timestamp: Date.now()
      }]);
      handleInitialMessage(initialMessage);
    }
  }, [router.query]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInitialMessage = async (message: string) => {
    setIsStreaming(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantMessage += chunk;
        
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.role === 'assistant') {
            newMessages[newMessages.length - 1].content = assistantMessage;
          } else {
            newMessages.push({
              role: 'assistant',
              content: assistantMessage,
              status: 'streaming',
              timestamp: Date.now()
            });
          }
          return newMessages;
        });

        // 타이핑 효과를 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      setIsStreaming(false);
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.role === 'assistant') {
          newMessages[newMessages.length - 1].status = 'complete';
        }
        return newMessages;
      });

    } catch (error) {
      console.error('Error:', error);
      setIsStreaming(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      status: 'complete',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    await handleInitialMessage(message);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6">
        <ChatMessages 
          messages={messages}
          handleSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
          isLoading={isStreaming}
          context="chat"
        />
      </div>
      <div className="flex-shrink-0 p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput 
            onSendMessage={handleSendMessage}
            placeholder="메시지를 입력하세요..."
            disabled={isStreaming}
            context="chat"
          />
        </div>
      </div>
    </div>
  );
} 