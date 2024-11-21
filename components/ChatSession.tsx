import React, { useRef, useEffect } from 'react';

interface Message {
  text: string;
  isBot: boolean;
}

interface ChatSessionProps {
  title: string;
  messages: Message[];
}

const ChatSession: React.FC<ChatSessionProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`p-3 rounded-lg ${message.isBot ? 'bg-offset dark:bg-offsetDark' : 'bg-super dark:bg-superDark text-white'} max-w-3/4 ${message.isBot ? 'self-start' : 'self-end ml-auto'}`}>
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatSession;

