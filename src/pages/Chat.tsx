import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProgressPanel } from '../components/ProgressPanel';
import '../styles/chat.css';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  status?: 'loading' | 'streaming' | 'complete';
  timestamp?: number;
}

function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 초기 메시지 설정
  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if (initialMessage) {
      setMessages([{
        role: 'user',
        content: initialMessage,
        status: 'complete',
        timestamp: Date.now()
      }]);
      handleInitialMessage(initialMessage);
    }
  }, [location.state]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      status: 'complete',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    await handleInitialMessage(input);
  };

  return (
    <div className="chat-view">
      <div className="chat-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← 돌아가기
        </button>
        <h2>ETF 투자 상담</h2>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role} ${message.status}`}>
            <div className="message-header">
              <span className="message-role">
                {message.role === 'user' ? '사용자' : 'AI 어시스턴트'}
              </span>
              {message.timestamp && (
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="message-content">
              {message.status === 'loading' ? (
                <div className="skeleton-container">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="skeleton-line" 
                         style={{ width: `${Math.random() * 40 + 60}%` }} />
                  ))}
                </div>
              ) : (
                <div className={message.status === 'streaming' ? 'streaming-content' : ''}>
                  {message.content}
                  {message.status === 'streaming' && (
                    <span className="cursor-blink">|</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={isStreaming}
        />
        <button type="submit" disabled={isStreaming || !input.trim()}>
          {isStreaming ? '생성 중...' : '전송'}
        </button>
      </form>

      <ProgressPanel />
    </div>
  );
}

export default Chat; 