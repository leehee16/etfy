import React, { useState } from 'react';
import { Book, TrendingUp, Search, BarChartIcon as ChartBar } from 'lucide-react';
import ChatSession from './ChatSession';
import SearchInput from './SearchInput';
import InvestmentStyleTest from './InvestmentStyleTest';
import InvestmentKnowledgeTest from './InvestmentKnowledgeTest';
import ETFQuiz from './ETFQuiz';
import Archive from './Archive';

interface MainContentProps {
  isSidebarOpen: boolean;
  activeSession: string;
  setActiveSession: React.Dispatch<React.SetStateAction<string>>;
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ icon, title, description, color, onClick }) => {
  return (
    <button 
      className={`bg-background dark:bg-backgroundDark p-6 rounded-lg shadow-md text-left w-full transition-all duration-300 hover:scale-105 focus:outline-none`}
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div className={`mr-4 text-${color}`}>{icon}</div>
        <h3 className="text-xl font-semibold text-textMain dark:text-textMainDark">{title}</h3>
      </div>
      <p className="text-textOff dark:text-textOffDark">{description}</p>
    </button>
  );
};

const MainContent: React.FC<MainContentProps> = ({ isSidebarOpen, activeSession, setActiveSession }) => {
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);

  const cards = [
    { icon: <Book size={24} />, title: "기초공부하기", description: "ETF 투자의 기본 개념을 학습합니다.", color: "super", greeting: "반갑습니다! ETF 기초공부를 도와드릴 봇입니다." },
    { icon: <TrendingUp size={24} />, title: "투자시작하기", description: "실제 ETF 투자를 시작하는 방법을 알아봅니다.", color: "blue-500", greeting: "안녕하세요! ETF 투자를 시작해볼까요?" },
    { icon: <Search size={24} />, title: "살펴보기", description: "다양한 ETF 상품을 비교 분석합니다.", color: "green-500", greeting: "환영합니다! 다양한 ETF 상품을 살펴보겠습니다." },
    { icon: <ChartBar size={24} />, title: "분석하기", description: "ETF 성과와 시장 동향을 분석합니다.", color: "yellow-500", greeting: "안녕하세요! ETF 성과와 시장 동향을 분석해보겠습니다." },
  ];

  const handleCardClick = (title: string) => {
    setActiveSession(title);
    const selectedCardData = cards.find(card => card.title === title);
    if (selectedCardData) {
      setMessages([{ text: selectedCardData.greeting, isBot: true }]);
    }
  };

  const handleSendMessage = (message: string) => {
    if (activeSession === 'home') {
      setActiveSession("일반");
      setMessages([
        { text: "안녕하세요! ETF 투자에 대해 어떤 것이 궁금하신가요?", isBot: true },
        { text: message, isBot: false }
      ]);
    } else {
      setMessages(prev => [...prev, { text: message, isBot: false }, { text: "죄송합니다. 아직 이 기능은 개발 중입니다.", isBot: true }]);
    }
  };

  const renderContent = () => {
    switch (activeSession) {
      case 'home':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card) => (
              <Card
                key={card.title}
                icon={card.icon}
                title={card.title}
                description={card.description}
                color={card.color}
                onClick={() => handleCardClick(card.title)}
              />
            ))}
          </div>
        );
      case 'investmentStyle':
        return <InvestmentStyleTest />;
      case 'investmentKnowledge':
        return <InvestmentKnowledgeTest />;
      case 'etfQuiz':
        return <ETFQuiz />;
      case 'archive':
        return <Archive />;
      default:
        return (
          <ChatSession 
            title={activeSession}
            messages={messages}
          />
        );
    }
  };

  return (
    <div className={`flex flex-col h-screen ${isSidebarOpen ? 'pl-64' : 'pl-16'}`}>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-3/5 flex flex-col relative">
          <header className="bg-background dark:bg-backgroundDark p-4 shadow-md">
            <h1 className="text-2xl font-bold text-textMain dark:text-textMainDark">
              {activeSession === 'home' ? "ETF투자의 나침반" : activeSession}
            </h1>
          </header>
          <div className="flex-1 p-8 pb-20 overflow-y-auto">
            {renderContent()}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background dark:bg-backgroundDark border-t border-borderMain dark:border-borderMainDark">
            <SearchInput 
              onSendMessage={handleSendMessage}
              placeholder={activeSession !== 'home' ? "메시지를 입력하세요..." : "질문을 입력하여 시작하세요"}
              disabled={activeSession === 'home'}
            />
          </div>
        </div>
        <div className="w-2/5 bg-offset dark:bg-offsetDark p-8 overflow-y-auto">
          <RightPanel activeSession={activeSession} />
        </div>
      </div>
    </div>
  );
};

interface RightPanelProps {
  activeSession: string;
}

const RightPanel: React.FC<RightPanelProps> = ({ activeSession }) => {
  if (activeSession === 'home') {
    return (
      <>
        <h3 className="text-2xl font-bold mb-4 text-textMain dark:text-textMainDark">추천 ETF</h3>
        <ul className="space-y-2">
          <li className="text-textOff dark:text-textOffDark hover:text-textMain dark:hover:text-textMainDark cursor-pointer"># KODEX 200</li>
          <li className="text-textOff dark:text-textOffDark hover:text-textMain dark:hover:text-textMainDark cursor-pointer"># TIGER 미국 S&P500</li>
          <li className="text-textOff dark:text-textOffDark hover:text-textMain dark:hover:text-textMainDark cursor-pointer"># ARIRANG 고배당주</li>
          <li className="text-textOff dark:text-textOffDark hover:text-textMain dark:hover:text-textMainDark cursor-pointer"># KINDEX 미국 나스닥100</li>
        </ul>
      </>
    );
  }

  return (
    <>
      <h3 className="text-2xl font-bold mb-4 text-textMain dark:text-textMainDark">{activeSession} 관련 정보</h3>
      <p className="text-textOff dark:text-textOffDark mb-4">
        {activeSession === "기초공부하기" && "ETF의 기본 개념과 장단점, 투자 방법 등을 학습합니다."}
        {activeSession === "투자시작하기" && "실제 ETF 투자를 위한 계좌 개설, 매매 방법 등을 안내합니다."}
        {activeSession === "살펴보기" && "다양한 ETF 상품의 특징과 성과를 비교 분석합니다."}
        {activeSession === "분석하기" && "ETF 성과 지표와 시장 동향을 심층적으로 분석합니다."}
        {activeSession === "투자성향 테스트" && "개인의 투자 성향을 파악하여 적합한 ETF 투자 전략을 제안합니다."}
        {activeSession === "투자지식 테스트" && "ETF 투자에 관한 기본 지식을 테스트합니다."}
        {activeSession === "ETF 퀴즈" && "ETF에 대한 이해도를 높이는 퀴즈를 제공합니다."}
        {activeSession === "아카이브" && "과거의 ETF 관련 정보와 분석 자료를 보관합니다."}
      </p>
      <ul className="space-y-2">
        <li className="text-textOff dark:text-textOffDark hover:text-textMain dark:hover:text-textMainDark cursor-pointer"># {activeSession} 관련 토픽 1</li>
        <li className="text-textOff dark:text-textOffDark hover:text-textMain dark:hover:text-textMainDark cursor-pointer"># {activeSession} 관련 토픽 2</li>
        <li className="text-textOff dark:text-textOffDark hover:text-textMain dark:hover:text-textMainDark cursor-pointer"># {activeSession} 관련 토픽 3</li>
      </ul>
    </>
  );
};

export default MainContent;

