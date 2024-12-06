import React, { useState, useRef, useEffect } from 'react';
import { Book, TrendingUp, Search, BarChartIcon as ChartBar } from 'lucide-react';
import SearchInput from './SearchInput';
import RightPanel from './RightPanel';
import { Message, Reference } from '@/types/chat';
import { ChatMessages } from './ChatMessages';
import ChatInput from './ChatInput';

// 컨텍스트별 호버링 스타일 정의
const cardStyles = {
  '기초공부하기': {
    hover: 'hover:bg-[#FFE082] hover:text-gray-800',
    icon: '📚'
  },
  '투자시작하기': {
    hover: 'hover:bg-[#81C784] hover:text-white',
    icon: '🎯'
  },
  '살펴보기': {
    hover: 'hover:bg-[#64B5F6] hover:text-white',
    icon: '🔍'
  },
  '분석하기': {
    hover: 'hover:bg-[#F48FB1] hover:text-white',
    icon: '📊'
  }
};

interface MainContentProps {
  isSidebarOpen: boolean;
  activeSession: string;
  setActiveSession: React.Dispatch<React.SetStateAction<string>>;
}

const MainContent: React.FC<MainContentProps> = ({ isSidebarOpen, activeSession, setActiveSession }) => {
  const [sessionMessages, setSessionMessages] = useState<Record<string, Message[]>>({
    '기초공부하기': [],
    '투자시작하기': [],
    '살펴보기': [],
    '분석하기': []
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentReferences, setCurrentReferences] = useState<Reference[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSession === 'home') {
      setMessages([]);
      setCurrentReferences([]);
      setRelatedTopics([]);
    }
  }, [activeSession]);

  const cards = [
    { icon: <Book size={24} />, title: "기초공부하기", description: "ETF 투자의 기본 개념을 학습해요.", greeting: "반가워요! ETF 기초공부를 도와드릴 잇삐에요." },
    { icon: <TrendingUp size={24} />, title: "투자시작하기", description: "ETF 투자를 시작하는 방법을 알아봐요.", greeting: "안녕하세요! ETF 투자를 시작해볼까요?" },
    { icon: <Search size={24} />, title: "살펴보기", description: "시장동향을 같이 살펴봐요.", greeting: "환영합니다! 오늘은 무슨 이슈가 있을까요?." },
    { icon: <ChartBar size={24} />, title: "분석하기", description: "내 자산에서 ETF를 분석해요.", greeting: "안녕하세요! 같이 ETF를 살펴봐요." },
  ];

  const handleCardClick = (title: string) => {
    setActiveSession(title);
    const greeting = cards.find(card => card.title === title)?.greeting || '안녕하세요!';
    setMessages([{ role: 'assistant', content: greeting }]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    const userMessage: Message = { 
      role: 'user', 
      content: message,
      context: activeSession
    };
    setMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    setIsLoading(true);

    try {
      const thinkingMessage: Message = {
        role: 'assistant',
        content: null,
        context: activeSession
      };
      setMessages(prev => [...prev, thinkingMessage]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          messages: [...messages, userMessage],
          context: activeSession
        }),
      });

      if (!response.ok) throw new Error('API 응답 오류');

      const data = await response.json();
      
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message,
        references: data.references || [],
        relatedTopics: data.relatedTopics || [],
        nextCards: data.nextCards || [],
        context: activeSession
      };

      setMessages(prev => prev.map((msg, index) => 
        index === prev.length - 1 ? aiMessage : msg
      ));
      setCurrentReferences(data.references || []);
      setRelatedTopics(data.relatedTopics || []);
      
      setSessionMessages(prev => ({
        ...prev,
        [activeSession]: [...prev[activeSession] || [], userMessage, aiMessage]
      }));

    } catch (error) {
      console.error('에러 발생:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: '죄송합니다. 오류가 발생했습니다.',
        context: activeSession
      };
      setMessages(prev => [...prev, errorMessage]);
      
      setSessionMessages(prev => ({
        ...prev,
        [activeSession]: [...prev[activeSession] || [], userMessage, errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex-shrink-0 h-16 bg-[#1f1f1f] border-b border-[#2f2f2f]">
            <div className="h-full px-6 flex items-center">
              {activeSession !== 'home' && (
                <nav className="flex items-center space-x-1">
                  {[
                    { id: '기초공부하기', icon: <Book size={16} /> },
                    { id: '투자시작하기', icon: <TrendingUp size={16} /> },
                    { id: '살펴보기', icon: <Search size={16} /> },
                    { id: '분석하기', icon: <ChartBar size={16} /> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSession(item.id)}
                      className={`
                        relative px-4 py-2 rounded-lg transition-colors flex items-center space-x-2
                        ${activeSession === item.id 
                          ? 'bg-[#2f2f2f] text-gray-200' 
                          : 'text-gray-400 hover:text-gray-300 hover:bg-[#242424]'
                        }
                      `}
                      style={{
                        ...(sessionMessages[item.id]?.length > 0 ? {
                          border: '3px solid transparent',
                          backgroundImage: 'linear-gradient(#1f1f1f, #1f1f1f), linear-gradient(90deg, #60a5fa, #c084fc, #60a5fa)',
                          backgroundOrigin: 'border-box',
                          backgroundClip: 'padding-box, border-box',
                          animation: 'gradient 3s ease infinite'
                        } : {})
                      }}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.id}</span>
                    </button>
                  ))}
                </nav>
              )}
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {activeSession === 'home' && (
                <div className="flex-shrink-0 py-8 px-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-200 mb-2">
                    </h2>
                    <p className="text-gray-400">
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {cards.map((card) => {
                      const style = cardStyles[card.title as keyof typeof cardStyles];
                      return (
                        <button
                          key={card.title}
                          onClick={() => handleCardClick(card.title)}
                          className={`p-6 rounded-lg bg-[#242424] text-gray-200
                            transition-all duration-300 ease-in-out
                            ${style.hover}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{style.icon}</span>
                            <h3 className="text-xl font-bold">{card.title}</h3>
                          </div>
                          <p className="text-gray-400">{card.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Chat Container */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#1f1f1f]">
                <div className="flex-1 overflow-y-auto px-6">
                  <ChatMessages 
                    messages={messages} 
                    handleSendMessage={handleSendMessage} 
                    messagesEndRef={messagesEndRef}
                    context={activeSession}
                  />
                </div>
                <div className="flex-shrink-0 p-4 bg-[#1f1f1f]">
                  <div className="max-w-3xl mx-auto">
                    <ChatInput 
                      onSendMessage={handleSendMessage}
                      placeholder="메시지를 입력하세요..."
                      disabled={isLoading}
                      context={activeSession}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-80 flex-shrink-0 bg-[#242424] overflow-y-auto">
              <div className="p-6">
                <RightPanel 
                  activeSession={activeSession}
                  currentReferences={currentReferences}
                  relatedTopics={relatedTopics}
                  onTopicClick={handleSendMessage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderContent();
};

export default MainContent;

