import React, { useState } from 'react';
import { Send } from 'lucide-react';

// 컨텍스트별 테두리 스타일 정의
const contextBorderStyles = {
  '기초공부하기': 'border-[#FFE082] focus-within:ring-[#FFE082]',
  '투자시작하기': 'border-[#81C784] focus-within:ring-[#81C784]',
  '살펴보기': 'border-[#64B5F6] focus-within:ring-[#64B5F6]',
  '분석하기': 'border-[#F48FB1] focus-within:ring-[#F48FB1]'
};

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
  context
}) => {
  const [message, setMessage] = useState('');
  const borderStyle = context ? contextBorderStyles[context as keyof typeof contextBorderStyles] : 'border-gray-600';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={`
        flex items-center gap-2 p-2
        bg-[#242424] rounded-lg
        border-2 ${borderStyle}
        transition-all duration-300
        focus-within:ring-2 focus-within:ring-opacity-50
      `}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`
            p-2 rounded-lg
            transition-colors duration-300
            ${message.trim() && !disabled
              ? 'text-white hover:bg-gray-700'
              : 'text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput; 