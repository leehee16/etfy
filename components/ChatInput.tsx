import React, { useState, useRef, useEffect } from 'react';
import { ImagePlus, SendHorizontal } from 'lucide-react';

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
  onNextCards?: (cards: Array<{ title: string; content: string }>) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = '메시지를 입력하세요...',
  disabled = false,
  context = '기초공부하기',
  onNextCards
}) => {
  const [message, setMessage] = useState('');
  const [isContextChanging, setIsContextChanging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // 이미지 분석 요청
      const response = await fetch('/api/analyzeImage', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('이미지 분석에 실패했습니다.');
      }

      const data = await response.json();

      // nextCards가 있으면 상위 컴포넌트에 전달
      if (data.nextCards && onNextCards) {
        onNextCards(data.nextCards);
      }

      // 첫 번째 질문으로 채팅 프로세스 시작
      if (data.nextCards?.[0]?.content) {
        const firstQuestion = data.nextCards[0].content;
        onSendMessage(firstQuestion);
      }

    } catch (error) {
      console.error('이미지 처리 중 오류:', error);
      alert('이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <style>{styles}</style>
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`
            flex items-center
            bg-[#242424] rounded-xl
            border border-[#2f2f2f]
            context-input-transition
            ${isContextChanging ? 'context-input-animation' : ''}
            focus-within:ring-1 focus-within:ring-opacity-50
            ${contextStyle?.ring || 'focus-within:ring-gray-600'}
            relative h-[40px] overflow-hidden
          `}
          style={{
            '--context-shadow': contextStyle?.shadow || 'rgba(75, 85, 99, 0.4)'
          } as React.CSSProperties}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isProcessingImage ? '이미지 분석 중...' : placeholder}
            disabled={disabled || isProcessingImage}
            className="w-full bg-transparent border-none outline-none text-gray-200 placeholder-gray-400 py-2 pl-4 pr-24 text-sm"
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
          <div className="absolute right-3 flex items-center gap-2 -mt-[15px]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isProcessingImage}
              className="!w-7 !h-7 !p-0 flex items-center justify-center rounded-lg !bg-transparent disabled:opacity-50 !border-0"
              title="이미지 업로드"
              style={{ color: 'white !important', border: 'none !important' }}
            >
              <ImagePlus className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
            <button
              type="submit"
              disabled={!message.trim() || disabled || isProcessingImage}
              className="!w-7 !h-7 !p-0 flex items-center justify-center rounded-lg !bg-transparent disabled:opacity-50 !border-0"
              style={{ color: 'white !important', border: 'none !important' }}
            >
              <SendHorizontal className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </form>
    </>
  );
};

export default ChatInput; 