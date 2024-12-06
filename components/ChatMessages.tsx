import React from 'react';
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
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-textOff dark:text-textOffDark">
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {messages.map((msg, index) => (
        <div key={index} className="flex flex-col space-y-4">
          <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#242424] text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">
                {msg.content || (
                  <span className="flex items-center gap-2">
                    <span>생각중..</span>
                    <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse" />
                  </span>
                )}
              </p>
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
      ))}
      <div ref={messagesEndRef} className="h-px" />
    </div>
  );
}; 