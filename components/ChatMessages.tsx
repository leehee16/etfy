import React, { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import OpenAI from 'openai';

interface SubTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  weight: number;
}

interface ChatMessagesProps {
  messages: Message[];
  handleSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  context: string;
  isLoading: boolean;
  onSubTaskComplete: (task: any) => void;
  onAddSelectedText: (task: SubTask) => void;
}

// 컨텍스트별 색상 정의
const contextColors = {
  '기초공부하기': {
    primary: '#FFE082',
    secondary: '#FFB74D',
    gradient: 'from-amber-300 to-amber-500',
    bg: 'bg-amber-400'
  },
  '투자시작하기': {
    primary: '#81C784',
    secondary: '#4CAF50',
    gradient: 'from-green-400 to-green-600',
    bg: 'bg-green-500'
  },
  '살펴보기': {
    primary: '#64B5F6',
    secondary: '#2196F3',
    gradient: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-500'
  },
  '분석하기': {
    primary: '#F9A8D4',
    secondary: '#EC4899',
    gradient: 'from-pink-300 to-pink-500',
    bg: 'bg-pink-400'
  }
};

interface SelectableTextProps {
  children: string;
  isAssistant?: boolean;
}

const SelectableText: React.FC<SelectableTextProps> = ({ children, isAssistant }) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div 
      className="relative"
      onMouseUp={() => {
        const selection = window.getSelection();
        setIsSelected(!!selection && selection.toString().length > 0);
      }}
      onMouseDown={() => setIsSelected(false)}
    >
      <style jsx>{`
        div :global(.selectable) ::selection {
          background-color: #343541 !important;
          color: #ECECF1 !important;
          border-radius: 6px;
          padding: 2px 4px;
        }
      `}</style>
      <div className={`prose prose-invert max-w-none selectable ${isAssistant ? 'text-gray-200' : 'text-white'}`}>
        <ReactMarkdown>
          {children}
        </ReactMarkdown>
      </div>
    </div>
  );
};

interface SelectionPopupProps {
  rect: DOMRect;
  onReply: (text: string) => void;
  onAddToList: (text: string) => void;
  context: string;
}

const SelectionPopup: React.FC<SelectionPopupProps> = ({ rect, onReply, onAddToList, context }) => {
  const selection = window.getSelection();
  const selectedText = selection?.toString() || '';

  return (
    <div
      className="fixed z-50 bg-[#1f1f1f]/95 backdrop-blur-sm text-[#ECECF1] shadow-lg rounded-lg px-2 py-0.5 text-sm transform -translate-x-1/2 flex items-center gap-2"
      style={{
        top: Math.max(rect.top + window.scrollY - 45, 10),
        left: rect.left + (rect.width / 2),
      }}
    >
      <button 
        onClick={() => onReply(selectedText)}
        className="hover:bg-[#2f2f2f] rounded-lg px-2 py-0.5 transition-all duration-200 flex items-center gap-1.5 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
          <path d="m15 9-6 6"/>
          <path d="m9 9 6 6"/>
        </svg>
        <span>응답</span>
      </button>
      <button 
        onClick={() => onAddToList(selectedText)}
        className="text-amber-300 hover:bg-amber-300/10 rounded-lg px-2 py-0.5 transition-all duration-200 flex items-center gap-1.5 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:-translate-y-0.5">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
        <span>저장</span>
      </button>
    </div>
  );
};

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  handleSendMessage,
  messagesEndRef,
  context,
  isLoading,
  onSubTaskComplete,
  onAddSelectedText
}) => {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '') {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionRect(rect);
    } else {
      setSelectionRect(null);
    }
  };

  const handleReply = (text: string) => {
    handleSendMessage(text);
    setSelectionRect(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddToList = (text: string) => {
    if (onAddSelectedText) {
      onAddSelectedText({
        id: `selected-${Date.now()}`,
        title: text,
        description: '선택한 텍스트',
        completed: false,
        weight: 0
      });
    }
    setSelectionRect(null);
    window.getSelection()?.removeAllRanges();
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <>
      <style>
        {`
          .message-content ::selection {
            background-color: rgba(255, 224, 130, 0.3) !important;
            color: #ECECF1 !important;
          }
          .message-content ::-moz-selection {
            background-color: rgba(255, 224, 130, 0.3) !important;
            color: #ECECF1 !important;
          }
        `}
      </style>
      <div className="pt-16">
        {messages.map((message, index) => {
          const messageColors = message.context ? 
            contextColors[message.context as keyof typeof contextColors] : 
            contextColors[context as keyof typeof contextColors] || {
              primary: '#9575CD',
              secondary: '#673AB7',
              gradient: 'from-purple-400 to-purple-600',
              bg: 'bg-purple-500'
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
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r ${
                    contextColors[message.context as keyof typeof contextColors]?.gradient || 
                    contextColors[context as keyof typeof contextColors]?.gradient || 
                    'from-purple-400 to-purple-600'
                  } flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">잇삐</span>
                  </div>
                )}
                <div className={`${message.role === 'user' ? 'max-w-[60%]' : 'max-w-[75%]'}`}>
                  <div
                    className={`inline-block rounded-2xl w-full transition-all duration-200 ease-in-out ${
                      message.role === 'assistant'
                        ? 'bg-[#2f2f2f] text-gray-200 animate-slideInFromLeft p-4'
                        : `${messageColors.bg} text-white animate-slideInFromRight py-2 px-4 opacity-80`
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
                    <div className="message-content prose prose-invert max-w-none">
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    {message.nextCards && message.nextCards.length > 0 && (
                      <div className="mt-4 grid gap-2">
                        {message.nextCards.map((card, idx) => {
                          const isQuestion = card.type === 'question';
                          const cardContext = card.context || message.context || context;

                          // 컨텍스트별 스타일 클래스
                          const getContextClasses = (context: string) => {
                            switch(context) {
                              case '기초공부하기':
                                return {
                                  border: 'border-amber-500/20',
                                  bg: 'bg-amber-500/5',
                                  text: 'text-amber-300'
                                };
                              case '투자시작하기':
                                return {
                                  border: 'border-green-500/20',
                                  bg: 'bg-green-500/5',
                                  text: 'text-green-300'
                                };
                              case '살펴보기':
                                return {
                                  border: 'border-blue-500/20',
                                  bg: 'bg-blue-500/5',
                                  text: 'text-blue-300'
                                };
                              case '분석하기':
                                return {
                                  border: 'border-pink-500/20',
                                  bg: 'bg-pink-500/5',
                                  text: 'text-pink-300'
                                };
                              default:
                                return {
                                  border: 'border-gray-500/20',
                                  bg: 'bg-gray-500/5',
                                  text: 'text-gray-300'
                                };
                            }
                          };

                          const contextClasses = getContextClasses(cardContext);

                          // 메시지 정제 함수
                          const cleanMessage = (message: string) => {
                            return message.replace(/^(다음 단계 실행|다음 단계|실행|질문)\s*:\s*/i, '').trim();
                          };

                          return (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(cleanMessage(card.title))}
                              className={`p-3 rounded-lg border text-left transition-all duration-300 
                                ${contextClasses.border} bg-opacity-20 hover:bg-opacity-40 
                                ${contextClasses.bg} hover:${contextClasses.bg}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {isQuestion ? ' ' : ' '}
                                </span>
                                <h4 className={`text-sm font-medium ${contextClasses.text}`}>
                                  {card.title}
                                </h4>
                              </div>
                              <p className="text-xs text-gray-400 mt-1 ml-7">{card.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="pl-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${
                contextColors[context as keyof typeof contextColors]?.gradient || 'from-purple-400 to-purple-600'
              } flex items-center justify-center`}>
                <span className="text-white text-sm font-medium">잇삐</span>
              </div>
              <div className="inline-block rounded-lg p-4 bg-[#2f2f2f] w-[75%]">
                <div className="space-y-2">
                  <div className={`h-4 rounded animate-pulse ${
                    contextColors[context as keyof typeof contextColors]?.bg || 'bg-purple-500'
                  } opacity-20`} />
                  <div className={`h-4 rounded animate-pulse ${
                    contextColors[context as keyof typeof contextColors]?.bg || 'bg-purple-500'
                  } opacity-20`} />
                  <div className={`h-4 rounded animate-pulse ${
                    contextColors[context as keyof typeof contextColors]?.bg || 'bg-purple-500'
                  } opacity-20 w-[80%]`} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {selectionRect && (
        <SelectionPopup 
          rect={selectionRect} 
          onReply={handleReply} 
          onAddToList={handleAddToList}
          context={context}
        />
      )}
    </>
  );
}; 