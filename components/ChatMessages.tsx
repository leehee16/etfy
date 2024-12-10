import React from 'react';
import { Message } from '@/types/chat';

interface ChatMessagesProps {
  messages: Message[];
  handleSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  context: string;
  isLoading: boolean;
}

// 컨텍스트별 색상 정의
const contextColors = {
  '기초공부하기': {
    primary: '#FFE082',
    secondary: '#FFB74D',
    gradient: 'from-amber-300 to-amber-500'
  },
  '투자시작하기': {
    primary: '#81C784',
    secondary: '#4CAF50',
    gradient: 'from-green-400 to-green-600'
  },
  '살펴보기': {
    primary: '#64B5F6',
    secondary: '#2196F3',
    gradient: 'from-blue-400 to-blue-600'
  },
  '분석하기': {
    primary: '#F48FB1',
    secondary: '#E91E63',
    gradient: 'from-pink-400 to-pink-600'
  }
};

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  handleSendMessage,
  messagesEndRef,
  context,
  isLoading
}) => {
  return (
    <div className="py-4">
      {messages.map((message, index) => {
        // 메시지의 컨텍스트에 따른 색상 사용
        const messageColors = message.context ? 
          contextColors[message.context as keyof typeof contextColors] : 
          contextColors[context as keyof typeof contextColors] || {
            primary: '#9575CD',
            secondary: '#673AB7',
            gradient: 'from-purple-400 to-purple-600'
          };

        return (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'assistant' 
                ? 'pl-4' 
                : 'pr-4'
            }`}
          >
            <div className={`flex items-start ${
              message.role === 'user' ? 'justify-end' : 'space-x-3'
            }`}>
              {message.role === 'assistant' && (
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r ${messageColors.gradient} flex items-center justify-center`}>
                  <span className="text-white text-sm font-medium">잇삐</span>
                </div>
              )}
              <div className={`${message.role === 'user' ? 'max-w-[60%]' : 'max-w-[75%]'}`}>
                <div
                  className={`inline-block rounded-lg p-4 w-full transition-all duration-200 ease-in-out ${
                    message.role === 'assistant'
                      ? 'bg-[#2f2f2f] text-gray-200 animate-slideInFromLeft'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white animate-slideInFromRight'
                  }`}
                >
                  {message.role === 'assistant' && message.context && (
                    <div className={`text-xs mb-1 inline-block rounded px-1.5 py-0.5 font-medium
                      ${message.context === '기초공부하기' ? 'bg-amber-500/20 text-amber-300' : ''}
                      ${message.context === '투자시작하기' ? 'bg-green-500/20 text-green-300' : ''}
                      ${message.context === '살펴보기' ? 'bg-blue-500/20 text-blue-300' : ''}
                      ${message.context === '분석하기' ? 'bg-pink-500/20 text-pink-300' : ''}
                    `}>
                      {message.context === '기초공부하기' && '📚 기초 학습'}
                      {message.context === '투자시작하기' && '🎯 투자 시작'}
                      {message.context === '살펴보기' && '🔍 시장 조사'}
                      {message.context === '분석하기' && '📊 투자 분석'}
                    </div>
                  )}
                  <pre className="whitespace-pre-wrap font-sans break-words">
                    {message.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {isLoading && (
        <div className="pl-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r ${contextColors[context as keyof typeof contextColors]?.gradient} flex items-center justify-center animate-fadeIn`}>
              <span className="text-white text-sm font-medium">잇삐</span>
            </div>
            <div className="inline-block rounded-lg p-4 bg-[#2f2f2f] animate-fadeIn">
              <div className="flex space-x-2">
                <div 
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${contextColors[context as keyof typeof contextColors]?.gradient} animate-bounce`} 
                  style={{ animationDelay: '0ms' }}
                />
                <div 
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${contextColors[context as keyof typeof contextColors]?.gradient} animate-bounce`} 
                  style={{ animationDelay: '150ms' }}
                />
                <div 
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${contextColors[context as keyof typeof contextColors]?.gradient} animate-bounce`} 
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}; 