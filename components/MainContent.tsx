import React, { useState, useRef, useEffect } from 'react';
import { Book, TrendingUp, Search, BarChartIcon as ChartBar } from 'lucide-react';
import RightPanel from './RightPanel';
import { Reference } from '@/types/chat';
import { ChatMessages } from './ChatMessages';
import ChatInput from './ChatInput';

interface SubTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  weight: number;
}

interface CurrentStep {
  id: number;
  title: string;
  description: string;
  progress: number;
  subTasks: SubTask[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  context?: string;
  references?: Reference[];
  relatedTopics?: string[];
  nextCards?: any[];
  currentStep?: CurrentStep;
}

// 컨텍스트별 호버링 스타일 정의
const cardStyles = {
  '기초공부하기': {
    hover: 'hover:bg-[#FFE082] hover:text-gray-800',
    icon: '📚',
    active: 'bg-[#2f2f2f]',
    gradient: 'linear-gradient(#1f1f1f, #1f1f1f), linear-gradient(90deg, #FFE082, #FFB74D)',
    dotColor: '#FFE082'
  },
  '투자시작하기': {
    hover: 'hover:bg-[#81C784] hover:text-white',
    icon: '🎯',
    active: 'bg-[#2f2f2f]',
    gradient: 'linear-gradient(#1f1f1f, #1f1f1f), linear-gradient(90deg, #81C784, #4CAF50)',
    dotColor: '#81C784'
  },
  '살펴보기': {
    hover: 'hover:bg-[#64B5F6] hover:text-white',
    icon: '🔍',
    active: 'bg-[#2f2f2f]',
    gradient: 'linear-gradient(#1f1f1f, #1f1f1f), linear-gradient(90deg, #64B5F6, #2196F3)',
    dotColor: '#64B5F6'
  },
  '분석하기': {
    hover: 'hover:bg-[#F48FB1] hover:text-white',
    icon: '📊',
    active: 'bg-[#2f2f2f]',
    gradient: 'linear-gradient(#1f1f1f, #1f1f1f), linear-gradient(90deg, #F9A8D4, #EC4899)',
    dotColor: '#F9A8D4'
  }
};

interface MainContentProps {
  isSidebarOpen: boolean;
  activeSession: string;
  setActiveSession: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardCard = ({ 
  title, 
  content, 
  icon, 
  style, 
  onClick 
}: { 
  title: string; 
  content: React.ReactNode; 
  icon: React.ReactNode; 
  style: any; 
  onClick: () => void; 
}) => (
  <button
    onClick={onClick}
    className={`group p-6 rounded-lg bg-[#242424] text-gray-200 transition-all duration-300 ease-in-out hover:scale-105 min-h-[200px] w-full ${style.hover}`}
  >
    <div className="flex items-center gap-2 mb-4">
      <span className="text-2xl">{style.icon}</span>
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    {content}
  </button>
);

const SimpleLineChart = () => (
  <div className="relative h-16 mt-4 z-10">
    <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
      <div className="w-1/4 h-8 bg-green-500/20 rounded-sm group-hover:animate-chart-line1"></div>
      <div className="w-1/4 h-6 bg-green-500/30 rounded-sm group-hover:animate-chart-line2"></div>
      <div className="w-1/4 h-10 bg-green-500/40 rounded-sm group-hover:animate-chart-line3"></div>
      <div className="w-1/4 h-12 bg-green-500/50 rounded-sm group-hover:animate-chart-line4"></div>
    </div>
  </div>
);

const MainContent: React.FC<MainContentProps> = ({ isSidebarOpen, activeSession, setActiveSession }) => {
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>({
    '기초공부하기': [],
    '투자시작하기': [],
    '살펴보기': [],
    '분석하기': []
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentReferences, setCurrentReferences] = useState<Reference[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<CurrentStep | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 서브태스크 완료 처리
  const handleSubTaskComplete = (taskId: string, completed: boolean) => {
    if (!currentStep) return;

    const updatedSubTasks = currentStep.subTasks.map(task =>
      task.id === taskId ? { ...task, completed } : task
    );

    // 진행률 계산
    const totalWeight = updatedSubTasks.reduce((sum, task) => sum + task.weight, 0);
    const completedWeight = updatedSubTasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + task.weight, 0);

    const progress = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;

    const updatedStep = {
      ...currentStep,
      subTasks: updatedSubTasks,
      progress
    };

    console.log('Updating currentStep:', updatedStep);
    setCurrentStep(updatedStep);
  };

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
    { icon: <Search size={24} />, title: "살펴보기", description: "시장동향을 같이 살펴봐요.", greeting: "환영합니다! 오늘은 무슨 이슈가 있을까요?" },
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

  const defaultCurrentStep = {
    id: 1,
    title: "증권계좌 개설 단계",
    description: "ETF 투자를 위해서는 먼저 증권계좌를 개설해야 합니다.",
    progress: 0,
    subTasks: [
      {
        id: "1-1",
        title: "증권사 비교 및 선택",
        description: "다양한 증권사를 비교하고 자신에게 맞는 증권사를 선택하세요.",
        completed: false,
        weight: 25
      },
      {
        id: "1-2",
        title: "앱 설치",
        description: "선택한 증권사의 모바일 거래 앱(MTS)을 스마트폰에 설치하세요.",
        completed: false,
        weight: 25
      },
      {
        id: "1-3",
        title: "신분증 준비",
        description: "신분증을 준비하고 스마트폰으로 촬영해 두세요.",
        completed: false,
        weight: 25
      },
      {
        id: "1-4",
        title: "계좌 개설 완료",
        description: "모든 준비가 끝나면 증권사에서 계좌 개설을 완료하세요.",
        completed: false,
        weight: 25
      }
    ]
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setIsLoading(true);

    try {
      // 컨텍스트 감지
      const contextResponse = await fetch('/api/detectContext', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!contextResponse.ok) throw new Error('컨텍스트 감지 실패');
      
      const { context } = await contextResponse.json();
      
      // 컨텍스트 정규화
      const normalizedContext = context === '투자 시작하기' ? '투자시작하기' : context;
      
      // 세션 전환
      setActiveSession(normalizedContext);

      const userMessage: ChatMessage = { 
        role: 'user',
        content: message,
        context: normalizedContext
      };
      setMessages(prev => [...prev, userMessage]);
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          messages: [...messages, userMessage],
          context: normalizedContext
        }),
      });

      if (!response.ok) throw new Error('API 응답 오류');

      const data = await response.json();
      console.log('API Response:', data);
      
      // 투자 시작하기 컨텍스트에서 currentStep 업데이트
      if (normalizedContext === '투자시작하기') {
        const step = data.currentStep || defaultCurrentStep;
        console.log('Setting currentStep:', step);
        setCurrentStep(step);
      }

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        references: data.references || [],
        relatedTopics: data.relatedTopics || [],
        nextCards: data.nextCards || [],
        context: normalizedContext,
        currentStep: data.currentStep || defaultCurrentStep
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentReferences(data.references || []);
      setRelatedTopics(data.relatedTopics || []);
      
      setSessionMessages(prev => ({
        ...prev,
        [normalizedContext]: [...(prev[normalizedContext] || []), userMessage, aiMessage]
      }));

    } catch (error) {
      console.error('에러 발생:', error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: '죄송합니다. 오류가 발생했습니다.',
        context: activeSession
      };
      setMessages(prev => [...prev, errorMessage]);
      
      setSessionMessages(prev => ({
        ...prev,
        [activeSession]: [...prev[activeSession] || [], errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 디버깅용 로그
  useEffect(() => {
    console.log('MainContent state:', {
      activeSession,
      activeSessionType: typeof activeSession,
      currentStep,
      context: messages[messages.length - 1]?.context,
      isInvestmentContext: activeSession === '투자시작하기',
      lastMessage: messages[messages.length - 1]
    });
  }, [activeSession, currentStep, messages]);

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
                        group relative px-4 py-2 rounded-lg transition-colors flex items-center space-x-2
                        ${activeSession === item.id 
                          ? `${cardStyles[item.id as keyof typeof cardStyles].active} text-gray-200 border-2 border-transparent` 
                          : 'text-gray-400 hover:text-gray-300 hover:bg-[#242424]'
                        }
                      `}
                      style={{
                        ...(activeSession === item.id ? {
                          border: '2px solid transparent',
                          backgroundImage: cardStyles[item.id as keyof typeof cardStyles].gradient,
                          backgroundOrigin: 'border-box',
                          backgroundClip: 'padding-box, border-box',
                          animation: sessionMessages[item.id]?.some(msg => msg.context === item.id) 
                            ? 'gradient 3s ease infinite'
                            : 'none'
                        } : {})
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        {sessionMessages[item.id]?.some(msg => msg.context === item.id) && (
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ 
                              backgroundColor: cardStyles[item.id as keyof typeof cardStyles].dotColor
                            }}
                          />
                        )}
                        {item.icon}
                        <span className="text-sm font-medium">{item.id}</span>
                      </div>
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
                      ETF 투자 도우미
                    </h2>
                    <p className="text-gray-400">
                      무엇을 도와드릴까요?
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <DashboardCard
                      title="기초공부하기"
                      content={
                        <div className="space-y-2 animate-fade-in">
                          <div className="bg-[#2f2f2f] p-3 rounded-lg min-h-[120px]">
                            <div className="flex items-center gap-2 text-amber-300 mb-3">
                              <span className="text-xl">📖</span>
                              <p className="text-sm">최근 학습한 용어</p>
                            </div>
                            <p className="text-gray-300 group-hover:hidden">ETF 추적오차율</p>
                            <p className="text-gray-300 text-xs leading-relaxed hidden group-hover:block">
                              목표와 실제 성적이 얼마나 다른지 알려주는 숫자
                            </p>
                            <div className="flex gap-2 flex-wrap mt-3">
                              <span className="px-2 py-1 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help" title="주가 변동의 2배 수익을 추구하는 ETF입니다.">레버리지</span>
                              <span className="px-2 py-1 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help" title="주가 하락 시 수익을 추구하는 ETF입니다.">인버스</span>
                              <span className="px-2 py-1 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help" title="기업의 시가총액 비중에 따라 투자하는 방식입니다.">시총가중</span>
                            </div>
                          </div>
                        </div>
                      }
                      icon={<Book size={24} />}
                      style={cardStyles['기초공부하기']}
                      onClick={() => handleCardClick('기초공부하기')}
                    />
                    <DashboardCard
                      title="투자시작하기"
                      content={
                        <div className="space-y-2 animate-fade-in">
                          <div className="bg-[#2f2f2f] p-3 rounded-lg min-h-[120px]">
                            <div className="flex items-center gap-2 text-green-300 mb-3">
                              <span className="text-xl">💡</span>
                              <p className="text-sm">새로운 투자 방법</p>
                            </div>
                            <p className="text-gray-300 text-sm mb-3">ISA 계좌로 ETF 투자하기</p>
                            <div className="flex gap-2 flex-wrap">
                              <span className="px-2 py-1 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help" title="증권사 계좌를 만들어요">계좌개설</span>
                              <span className="px-2 py-1 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help" title="투자 성향을 파악해요">투자성향</span>
                              <span className="px-2 py-1 bg-[#242424] rounded-full text-xs text-gray-300 cursor-help" title="실제 투자를 시작해요">매매하기</span>
                            </div>
                          </div>
                        </div>
                      }
                      icon={<TrendingUp size={24} />}
                      style={cardStyles['투자시작하기']}
                      onClick={() => handleCardClick('투자시작하기')}
                    />
                    <DashboardCard
                      title="살펴보기"
                      content={
                        <div className="bg-[#2f2f2f] p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-300 mb-2">
                            <span className="text-xl">🔥</span>
                            <p className="text-sm">실시간 HOT</p>
                          </div>
                          <p className="text-gray-300 text-sm">AI 테마 ETF 급등 원인 분석</p>
                        </div>
                      }
                      icon={<Search size={24} />}
                      style={cardStyles['살펴보기']}
                      onClick={() => handleCardClick('살펴보기')}
                    />
                    <DashboardCard
                      title="분석하기"
                      content={
                        <div className="space-y-2 animate-fade-in">
                          <div className="bg-[#2f2f2f] p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-300">KODEX 200</span>
                              <span className="text-green-400">+2.0%</span>
                            </div>
                            <div className="relative mt-2">
                              <SimpleLineChart />
                            </div>
                          </div>
                        </div>
                      }
                      icon={<ChartBar size={24} />}
                      style={cardStyles['분석하기']}
                      onClick={() => handleCardClick('분석하기')}
                    />
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
                    isLoading={isLoading}
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
                {console.log('Rendering RightPanel with props:', {
                  activeSession,
                  hasCurrentStep: !!currentStep,
                  currentStep,
                  context: messages[messages.length - 1]?.context
                })}
                <RightPanel 
                  activeSession={activeSession}
                  currentReferences={currentReferences}
                  relatedTopics={relatedTopics}
                  onTopicClick={handleSendMessage}
                  currentStep={currentStep}
                  onSubTaskComplete={handleSubTaskComplete}
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

