import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/types/chat';
import { ChartBar, Search } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  handleSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  handleSendMessage, 
  messagesEndRef 
}) => {
  const animatedMessages = useRef(new Set<string>());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    // 새로운 메시지가 추가되었고, 그것이 사용자의 메시지일 때만 스크롤
    if (messages.length > prevMessagesLengthRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    // 새 메시지가 추가될 때마다 마지막 메시지만 애니메이션 적용
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const msgKey = `${lastMsg.role}-${messages.length - 1}`;
      if (!animatedMessages.current.has(msgKey)) {
        animatedMessages.current.add(msgKey);
      }
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-textOff dark:text-textOffDark">
      </div>
    );
  }

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 p-4 space-y-4 overflow-y-auto"
    >
      {messages.map((msg, index) => {
        const msgKey = `${msg.role}-${index}`;
        const shouldAnimate = index === messages.length - 1;

        return (
          <div key={msgKey} className={`flex flex-col space-y-4 ${shouldAnimate ? 'animate-fadeIn' : ''}`}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-4 rounded-lg transform transition-all duration-300 ease-in-out ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#242424] text-gray-200'
                }`}
              >
                {msg.content ? (
                  <ReactMarkdown 
                    className="whitespace-pre-wrap break-words prose dark:prose-invert prose-sm max-w-none"
                    components={{
                      // 코드 블록 스타일링
                      code({ node, inline, className, children, ...props }) {
                        return (
                          <code
                            className={`${inline ? 'bg-gray-700 rounded px-1' : 'block bg-gray-700 p-2 rounded'} ${className}`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      // 링크 스타일링
                      a({ node, className, children, ...props }) {
                        return (
                          <a
                            className="text-blue-300 hover:text-blue-400 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      },
                      // 일반 텍스트 래핑
                      p({ children }) {
                        return (
                          <div className="overflow-hidden">
                            <p className={`whitespace-pre-wrap ${shouldAnimate ? 'animate-slideContent' : ''}`}>
                              {children}
                            </p>
                          </div>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>생각중</span>
                    <span className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </span>
                )}
                {msg.role === 'assistant' && msg.references && msg.references.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2"></p>
                    <div className="space-y-2">
                      {msg.references.map((ref, refIndex) => (
                        <div 
                          key={refIndex} 
                          className="text-sm bg-gray-200 dark:bg-gray-700 p-2 rounded flex justify-between items-center"
                        >
                          <div className="font-medium text-gray-700 dark:text-gray-300">
                            {ref.title}
                          </div>
                          {ref.source && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded">
                               {ref.source}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {msg.role === 'assistant' && msg.nextCards && msg.nextCards.length > 0 && (
              <div className="space-y-2 max-w-3xl mx-auto">
                {msg.nextCards.map((card, cardIndex) => (
                  <button
                    key={cardIndex}
                    onClick={() => handleSendMessage(card.title)}
                    className="w-full text-left p-4 rounded-lg bg-white dark:bg-gray-700 
                             shadow-sm hover:shadow-md transition-shadow 
                             border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-500">
                        {card.type === 'action' ? <ChartBar size={20} /> : <Search size={20} />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {card.title}
                        </h4>
                        {card.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {card.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} className="h-px" />
      <button
        onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </div>
  );
}; 