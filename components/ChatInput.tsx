import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

// 컨텍스트별 테두리 스타일 정의
const contextBorderStyles = {
  '기초공부하기': {
    border: 'border-[#FFE082]',
    ring: 'focus-within:ring-[#FFE082]',
    shadow: 'rgba(255, 224, 130, 0.4)'
  },
  '투자시작하기': {
    border: 'border-[#81C784]',
    ring: 'focus-within:ring-[#81C784]',
    shadow: 'rgba(129, 199, 132, 0.4)'
  },
  '살펴보기': {
    border: 'border-[#64B5F6]',
    ring: 'focus-within:ring-[#64B5F6]',
    shadow: 'rgba(100, 181, 246, 0.4)'
  },
  '분석하기': {
    border: 'border-[#F48FB1]',
    ring: 'focus-within:ring-[#F48FB1]',
    shadow: 'rgba(244, 143, 177, 0.4)'
  }
};

const styles = `
  @keyframes inputBorderPulse {
    0% {
      box-shadow: 0 0 0 0 var(--context-shadow);
    }
    70% {
      box-shadow: 0 0 0 8px transparent;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }

  .context-input-transition {
    transition: all 0.3s ease;
  }

  .context-input-animation {
    animation: inputBorderPulse 1s ease-out;
  }
`;

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  context?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = '메시지를 입력하세요...',
  disabled = false,
  context = '기초공부하기'
}) => {
  const [message, setMessage] = useState('');
  const [isContextChanging, setIsContextChanging] = useState(false);
  const contextStyle = context ? contextBorderStyles[context as keyof typeof contextBorderStyles] : null;

  // 컨텍스트 변경 감지 및 애니메이션 처리
  useEffect(() => {
    setIsContextChanging(true);
    const timer = setTimeout(() => {
      setIsContextChanging(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [context]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <>
      <style>{styles}</style>
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`
            flex items-center
            bg-[#242424] rounded-lg
            border-2 ${contextStyle?.border || 'border-gray-600'}
            context-input-transition
            ${isContextChanging ? 'context-input-animation' : ''}
            focus-within:ring-2 focus-within:ring-opacity-50
            ${contextStyle?.ring || 'focus-within:ring-gray-600'}
          `}
          style={{
            '--context-shadow': contextStyle?.shadow || 'rgba(75, 85, 99, 0.4)'
          } as React.CSSProperties}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-transparent border-none outline-none text-gray-200 placeholder-gray-400 py-2 px-3 h-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (message.trim() && !disabled) {
                  onSendMessage(message);
                  setMessage('');
                }
              }
            }}
          />
        </div>
      </form>
    </>
  );
};

export default ChatInput; 